import type { AdminErrorReason } from "../../domain/AdminErrors.js";
import { AdminError } from "../../domain/AdminErrors.js";

export function mapAdminError(reason: AdminErrorReason): { status: number; message: string } {
    switch (reason) {
        case AdminError.Forbidden:
            return { status: 403, message: "Bạn không có quyền admin." };

        case AdminError.EmailNotAllowed:
            return { status: 400, message: "Email không thuộc phạm vi cho phép." };

        case AdminError.RoleMismatch:
            return { status: 400, message: "Role không khớp với email." };

        case AdminError.EmailAlreadyExists:
            return { status: 409, message: "Email đã tồn tại." };

        case AdminError.UserNotFound:
            return { status: 404, message: "Không tìm thấy người dùng." };

        case AdminError.ExcelInvalidFormat:
            return { status: 400, message: "File Excel không hợp lệ/không đọc được." };

        case AdminError.ExcelEmpty:
            return { status: 400, message: "File Excel rỗng/không có dữ liệu." };

        case AdminError.ExcelRowInvalid:
            return { status: 400, message: "Có dòng dữ liệu không hợp lệ trong file Excel." };

        case AdminError.ValidationFailed:
            return { status: 400, message: "Dữ liệu không hợp lệ." };

        default:
            return { status: 400, message: "Yêu cầu không hợp lệ." };
    }
}