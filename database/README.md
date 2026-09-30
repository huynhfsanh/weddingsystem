# Import cơ sở dữ liệu bằng MySQL Workbench

File cần chạy: `database/wedding_management_full.sql`.

## Cách thực hiện

1. Mở MySQL Workbench và kết nối tới MySQL local bằng tài khoản `root`.
2. Chọn `File` → `Open SQL Script`.
3. Chọn file `wedding_management_full.sql` trong thư mục này.
4. Nhấn biểu tượng tia sét để chạy toàn bộ script.
5. Chạy câu lệnh sau để kiểm tra:

```sql
USE wedding_management;
SHOW TABLES;
SELECT email, full_name FROM users;
```

Kết quả mong đợi là 27 bảng và 4 tài khoản mẫu.

## Tài khoản đăng nhập ứng dụng

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@example.com` | `Wedding@123` |
| Staff | `staff1@example.com` | `Wedding@123` |
| Staff | `staff2@example.com` | `Wedding@123` |
| Customer | `customer@example.com` | `Wedding@123` |

File SQL không chứa mật khẩu MySQL. Thông tin kết nối MySQL nằm trong `backend/.env`, là file cục bộ đã được `.gitignore` loại trừ.

Không chạy lại toàn bộ file sau khi đã nhập dữ liệu thật vì các câu lệnh tạo bảng được thiết kế cho lần khởi tạo database đầu tiên.

## Cập nhật database đã tồn tại

Nếu database được tạo trước khi có thư viện ảnh gói cưới, chạy file migration:

```text
backend/prisma/migrations/202609250002_package_images/migration.sql
```

Database tạo mới bằng `wedding_management_full.sql` đã bao gồm bảng và dữ liệu gallery, không cần chạy migration này lần nữa.

Nếu database đã có gallery nhưng chưa có thực đơn và chữ ký điện tử, chạy tiếp:

```text
backend/prisma/migrations/202609260001_menu_signature/migration.sql
```
