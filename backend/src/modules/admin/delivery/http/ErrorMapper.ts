import type { AdminErrorReason } from "../../domain/AdminErrors.js";

export function mapAdminError(reason: AdminErrorReason): { status: number; message: string } {
    switch (reason) {
        case "Forbidden":
            return { status: 403, message: "Bạn không có quyền thực hiện thao tác này." };
        case "ValidationFailed":
            return { status: 400, message: "Dữ liệu không hợp lệ." };
        case "EmailAlreadyExists":
            return { status: 409, message: "Email đã tồn tại." };
        case "UserNotFound":
            return { status: 404, message: "Không tìm thấy tài khoản." };
        case "ExcelInvalidFormat":
            return { status: 400, message: "File Excel sai định dạng hoặc không đọc được." };
        case "ExcelEmpty":
            return { status: 400, message: "File Excel không có dữ liệu." };
        case "RoleMismatch":
            return { status: 400, message: "Phân quyền không hợp lệ." };
        default:
            return { status: 500, message: "Lỗi không xác định." };
    }
}