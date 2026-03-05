import type { Prisma, PrismaClient } from "@prisma/client";
import { toPrismaRole, fromPrismaRole } from "../../../shared/infra/prisma/RoleMap.js";
import type { AdminUserRepo } from "../domain/AdminPorts.js";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  PageQuery,
  Paged,
  UserView,
} from "../domain/AdminTypes.js";

const includeProfiles = {
  student: true,
  teacher: true,
} satisfies Prisma.UserInclude;

type PrismaUserWithProfiles = Prisma.UserGetPayload<{
  include: typeof includeProfiles;
}>;

export class AdminUserRepoPrisma implements AdminUserRepo {
  constructor(private readonly prisma: PrismaClient) { }

  async getUserById(id: string): Promise<UserView | null> {
    const u = await this.prisma.user.findUnique({ where: { id }, include: includeProfiles });
    return u ? this.toUserView(u) : null;
  }

  async getUserByEmail(email: string): Promise<UserView | null> {
    const u = await this.prisma.user.findUnique({ where: { email }, include: includeProfiles });
    return u ? this.toUserView(u) : null;
  }

  async createUser(input: CreateUserInput, passwordHash: string | null): Promise<UserView> {
    const u = await this.prisma.user.create({
      data: {
        email: input.email,
        role: toPrismaRole[input.role],
        passwordHash,
        isActive: input.isActive ?? true,
        mustChangePassword: input.mustChangePassword ?? false,
        student: input.role === "student" ? { create: { ...input.student } } : undefined,
        teacher: input.role === "teacher" ? { create: { ...input.teacher } } : undefined,
      },
      include: includeProfiles,
    });
    return this.toUserView(u);
  }

  async updateUser(input: UpdateUserInput, passwordHash: string | null): Promise<UserView> {
    const existing = await this.prisma.user.findUnique({ where: { id: input.id }, include: includeProfiles });
    if (!existing) throw new Error("UserNotFound");

    const nextRole = input.role ?? fromPrismaRole[existing.role];

    const shouldDeleteStudent = nextRole !== "student" && existing.student;
    const shouldDeleteTeacher = nextRole !== "teacher" && existing.teacher;

    const u = await this.prisma.user.update({
      where: { id: input.id },
      data: {
        email: input.email,
        role: input.role ? toPrismaRole[input.role] : undefined,
        isActive: input.isActive,
        mustChangePassword: input.mustChangePassword,
        ...(passwordHash ? { passwordHash } : {}),

        student: shouldDeleteStudent ? { delete: true } : undefined,
        teacher: shouldDeleteTeacher ? { delete: true } : undefined,

        ...(input.student
          ? { student: { upsert: { create: { ...input.student }, update: { ...input.student } } } }
          : {}),
        ...(input.teacher
          ? { teacher: { upsert: { create: { ...input.teacher }, update: { ...input.teacher } } } }
          : {}),
      },
      include: includeProfiles,
    });

    return this.toUserView(u);
  }

  async setUserActive(userId: string, isActive: boolean): Promise<UserView> {
    const u = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: includeProfiles,
    });
    return this.toUserView(u);
  }

  async listUsers(filter: UserListFilter, page: PageQuery): Promise<Paged<UserView>> {
    const and: Prisma.UserWhereInput[] = [];

    if (filter.role) and.push({ role: toPrismaRole[filter.role] });
    if (typeof filter.isActive === "boolean") and.push({ isActive: filter.isActive });
    if (typeof filter.mustChangePassword === "boolean") and.push({ mustChangePassword: filter.mustChangePassword });

    // search theo email hoặc fullName (student/teacher)
    if (filter.q && filter.q.trim()) {
      const q = filter.q.trim();
      and.push({
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { student: { fullName: { contains: q, mode: "insensitive" } } },
          { teacher: { fullName: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    // filter student (có thể kết hợp nhiều thuộc tính)
    if (filter.studentCode) and.push({ student: { studentCode: { contains: filter.studentCode, mode: "insensitive" } } });
    if (filter.studentFullName) and.push({ student: { fullName: { contains: filter.studentFullName, mode: "insensitive" } } });
    if (filter.className) and.push({ student: { className: { contains: filter.className, mode: "insensitive" } } });
    if (filter.faculty) and.push({ student: { faculty: { contains: filter.faculty, mode: "insensitive" } } });
    if (filter.studentPhone) and.push({ student: { phone: { contains: filter.studentPhone, mode: "insensitive" } } });

    // filter teacher
    if (filter.teacherCode) and.push({ teacher: { teacherCode: { contains: filter.teacherCode, mode: "insensitive" } } });
    if (filter.teacherFullName) and.push({ teacher: { fullName: { contains: filter.teacherFullName, mode: "insensitive" } } });
    if (filter.department) and.push({ teacher: { department: { contains: filter.department, mode: "insensitive" } } });
    if (filter.teacherPhone) and.push({ teacher: { phone: { contains: filter.teacherPhone, mode: "insensitive" } } });

    const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};

    const pageSafe = page.page < 1 ? 1 : page.page;
    const pageSizeSafe = page.pageSize < 1 ? 20 : page.pageSize;
    const skip = (pageSafe - 1) * pageSizeSafe;
    const take = pageSizeSafe;

    const orderBy: Prisma.UserOrderByWithRelationInput =
      page.sortBy === "email" ? { email: page.sortDir ?? "asc" } : { createdAt: page.sortDir ?? "desc" };

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({ where, include: includeProfiles, skip, take, orderBy }),
    ]);

    return { items: items.map((u) => this.toUserView(u)), total, page: pageSafe, pageSize: pageSizeSafe };
  }

  private toUserView(u: PrismaUserWithProfiles): UserView {
    return {
      id: u.id,
      email: u.email,
      role: fromPrismaRole[u.role],
      isActive: u.isActive,
      mustChangePassword: u.mustChangePassword,
      createdAt: u.createdAt,
      student: u.student ?? null,
      teacher: u.teacher ?? null,
    };
  }
}