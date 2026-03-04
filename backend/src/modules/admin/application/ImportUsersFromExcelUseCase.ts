import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";

const studentRe = /^\d{10,12}@e\.tlu\.edu\.vn$/i;
const teacherRe = /^[a-z][a-z0-9._-]{2,30}@tlu\.edu\.vn$/i;

function inferRole(email) {
    if (studentRe.test(email)) return "student";
    if (teacherRe.test(email)) return "teacher";
    return null;
}

function randomPassword() {
    // MVP: password ngẫu nhiên (nên gửi qua kênh khác)
    return Math.random().toString(36).slice(2, 10) + "A1!";
}

export async function importUsersFromExcel({ prisma, buffer }) {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    // rows: [{email:"...", password:"..."}]
    const toCreate = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
        const rawEmail = String(rows[i].email || "").trim().toLowerCase();
        if (!rawEmail) {
            errors.push({ row: i + 2, message: "Missing email" });
            continue;
        }

        const role = inferRole(rawEmail);
        if (!role) {
            errors.push({ row: i + 2, email: rawEmail, message: "Email must be student (@e.tlu.edu.vn) or teacher (@tlu.edu.vn)" });
            continue;
        }

        const pwd = String(rows[i].password || "").trim() || randomPassword();
        const passwordHash = await bcrypt.hash(pwd, 10);

        toCreate.push({
            email: rawEmail,
            role,
            passwordHash,
            isActive: true,
            mustChangePassword: true,
            // (tuỳ bạn) trả pwd về cho admin để phát cho sinh viên/giảng viên
            _plainPassword: pwd,
        });
    }

    // CreateMany không trả plain password; bạn có thể lưu danh sách pwd vào file export riêng cho admin
    const createData = toCreate.map(({ _plainPassword, ...u }) => u);

    // tạo hàng loạt, bỏ trùng email
    const result = await prisma.user.createMany({
        data: createData,
        skipDuplicates: true,
    });

    return {
        inserted: result.count,
        errors,
        // WARNING: chỉ dùng khi bạn muốn trả password tạm cho admin
        credentials: toCreate.map((u) => ({ email: u.email, password: u._plainPassword })),
    };
}
