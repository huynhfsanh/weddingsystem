# Đặc tả REST API

Base URL local: `http://localhost:4000/api`.

API riêng tư nhận access token qua header:

```http
Authorization: Bearer <accessToken>
```

Response thành công dùng cấu trúc `{ "success": true, "data": ... }`. Response lỗi dùng `{ "success": false, "message": "..." }` và có thể kèm `details` cho lỗi validation.

## Xác thực

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/auth/register` | Công khai |
| POST | `/auth/login` | Công khai |
| POST | `/auth/logout` | Công khai |
| POST | `/auth/refresh` | Refresh token |
| GET | `/auth/me` | Đã đăng nhập |
| PATCH | `/auth/profile` | Đã đăng nhập |
| PATCH | `/auth/change-password` | Đã đăng nhập |

Admin quản lý người dùng qua `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `PATCH /users/:id/status`, `PATCH /users/:id/role` và `PATCH /users/:id/reset-password`. `DELETE` là vô hiệu hóa tài khoản để bảo toàn lịch sử.

## Danh mục và gói cưới

| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/packages`, `/packages/:id`, `/packages/slug/:slug` | Công khai |
| GET | `/packages/admin/all` | Admin, gồm cả gói đã ẩn |
| POST/PATCH/DELETE | `/packages`, `/packages/:id` | Admin |
| POST/DELETE | `/packages/:id/items`, `/packages/:id/items/:itemId` | Admin |
| POST | `/packages/:id/images` | Admin, thêm ảnh bằng URL |
| POST | `/packages/:id/images/upload` | Admin, tải file ảnh JPG/PNG/WebP |
| PATCH/DELETE | `/packages/:id/images/:imageId` | Admin, sửa/đặt ảnh bìa/xóa ảnh |
| GET | `/catalog-items`, `/catalog-items/:id` | Công khai |
| GET | `/catalog-items/admin/all` | Admin, gồm cả hạng mục đã ẩn |
| POST/PATCH/DELETE | `/catalog-items`, `/catalog-items/:id` | Admin |

## Hợp đồng và capacity

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST | `/contracts` | Customer/Admin, yêu cầu `menuComboId` và `selectedPackageItemIds` |
| POST | `/contracts/:id/signature` | Customer sở hữu hợp đồng, ký trước đặt cọc |
| GET | `/contracts/me` | Customer, chỉ dữ liệu của mình |
| GET | `/contracts` | Admin |
| GET/PATCH | `/contracts/:id` | Chủ sở hữu hoặc Admin |
| PATCH | `/contracts/:id/status` | Admin |
| POST | `/contracts/:id/cancel` | Chủ sở hữu hoặc Admin |
| POST/GET | `/contracts/:id/generate-pdf`, `/contracts/:id/pdf` | Người có quyền trên hợp đồng |
| GET | `/capacity/check-availability`, `/capacity/:date` | Công khai |
| GET/POST/PATCH | `/capacity`, `/capacity/:date` | Admin |
| DELETE | `/capacity/:date` | Admin, xóa mức tùy chỉnh để dùng mặc định |

## Thanh toán

| Method | Endpoint | Quyền |
| --- | --- | --- |
| POST/GET | `/contracts/:id/payments` | Chủ hợp đồng hoặc Admin |
| GET | `/payments`, `/payments/:id` | Admin hoặc chủ dữ liệu phù hợp |
| POST | `/payments/:id/payos-link` | Chủ hợp đồng hoặc Admin, tạo trang thanh toán payOS |
| POST | `/payments/:id/payos-sync` | Chủ hợp đồng hoặc Admin, đồng bộ trạng thái payOS |
| POST | `/payments/:id/confirm` | Admin |
| POST | `/payments/payos/webhook` | payOS, xác thực bằng checksum |
| POST | `/payments/casso/webhook` | Casso, xác thực bằng secret/signature |

Webhook chống lặp bằng `externalEventId`. payOS được xác thực bằng SDK chính thức; Casso Flow dùng khóa bảo mật webhook riêng. Payload payOS có chữ ký hợp lệ luôn nhận `200` để bước kiểm tra URL của payOS hoàn tất; chỉ đơn hàng khớp `orderCode` mới được đối soát. Số tiền và trạng thái được quyết định ở backend; frontend không thể tự xác nhận thanh toán.

## Điều phối và hiện trường

| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET/POST | `/assignments` | Admin |
| GET | `/assignments/:id` | Admin hoặc nhân viên được giao |
| PATCH/DELETE | `/assignments/:id` | Admin |
| POST | `/assignments/:id/check-in`, `/assignments/:id/check-out` | Nhân viên được giao |
| GET | `/staff/me/assignments`, `/staff/me/assignments/today` | Staff |
| POST/GET | `/assignments/:id/photos` | Admin hoặc nhân viên được giao |
| DELETE | `/photos/:id` | Admin hoặc người tải ảnh |
| POST | `/assignments/:id/damages` | Admin hoặc nhân viên được giao |
| GET/PATCH | `/damages`, `/damages/:id` | Theo vai trò và quyền sở hữu |
| PATCH | `/damages/:id/review` | Admin |
| POST/DELETE | `/damages/:id/cost-items`, `/damages/:id/cost-items/:itemId` | Admin |

## Lương, chatbot và quản trị

| Method | Endpoint | Quyền |
| --- | --- | --- |
| GET | `/payroll`, `/payroll/staff/:staffId` | Admin hoặc chính Staff |
| GET/POST | `/payroll/export`, `/payroll/mark-paid` | Admin |
| POST/GET/DELETE | `/chatbot/conversations...` | Đã đăng nhập, chỉ hội thoại của mình |
| GET | `/chatbot/faqs` | Công khai |
| GET | `/chatbot/faqs/admin/all` | Admin, gồm cả FAQ đã ẩn |
| POST/PATCH/DELETE | `/chatbot/faqs...` | Admin |
| GET | `/notifications` | Đã đăng nhập |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | Chủ thông báo |
| GET | `/admin/dashboard/*` | Admin |
| GET | `/audit-logs`, `/audit-logs/:id` | Admin |
| GET | `/menu-combos`, `/menu-combos/dishes`, `/menu-combos/:id` | Công khai |
| GET/POST/PATCH/DELETE | `/menu-combos...` | Admin quản lý combo và món |
| POST | `/menu-combos/:id/dishes/:dishId/image` | Admin, tải ảnh món JPG/PNG/WebP |
| GET | `/maps/geocode`, `/maps/place-details`, `/maps/directions` | Công khai, cần server key |
| GET | `/config/public` | Công khai, không trả secret |
| POST | `/support-requests` | Công khai hoặc Customer |
| GET | `/support-requests/mine` | Chủ yêu cầu |
| GET/PATCH | `/support-requests`, `/support-requests/:id` | Admin |

## Mã trạng thái chính

- `200`: truy vấn hoặc cập nhật thành công.
- `201`: tạo mới thành công.
- `204`: xóa/ẩn thành công, không có body.
- `401`: token hoặc chữ ký webhook không hợp lệ.
- `403`: đúng danh tính nhưng không có quyền.
- `404`: không tìm thấy dữ liệu trong phạm vi được phép.
- `409`: xung đột lịch, capacity, dữ liệu trùng hoặc trạng thái không hợp lệ.
- `422`: dữ liệu đầu vào không hợp lệ.
- `500`: lỗi nội bộ đã được che thông tin nhạy cảm.
