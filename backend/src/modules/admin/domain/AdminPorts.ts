import type { CreateUserInput, UpdateUserInput, UserListFilter, PageQuery, UserView, Paged, ParsedSpreadsheet } from "./AdminTypes.js";

export interface PasswordHasher {
    hash(password: string): Promise<string>;
}

export interface SpreadsheetReader {
    parseUsersFromExcel(fileBytes: Uint8Array): Promise<ParsedSpreadsheet>;
}

export interface AdminUserRepo {
    createUser(input: CreateUserInput, passwordHash: string | null): Promise<UserView>;
    updateUser(input: UpdateUserInput, passwordHash: string | null): Promise<UserView>;

    setUserActive(userId: string, isActive: boolean): Promise<UserView>;

    getUserById(id: string): Promise<UserView | null>;
    getUserByEmail(email: string): Promise<UserView | null>;

    listUsers(filter: UserListFilter, page: PageQuery): Promise<Paged<UserView>>;
}