# Hệ thống quản lý dịch vụ tiệc cưới Green Wedding

Ứng dụng web full-stack quản lý gói cưới, hợp đồng, capacity, thanh toán chuyển khoản, điều phối nhân sự, ảnh hiện trường, hư hại, bảng công và chatbot tư vấn.

## Chức năng đã triển khai

- Public: trang chủ, danh sách/chi tiết gói cưới, FAQ, giới thiệu và liên hệ.
- Customer: đăng ký, đăng nhập, tạo hợp đồng, chọn dịch vụ, địa điểm, thanh toán, PDF, chatbot và thông báo.
- Customer: chọn một trong 15 combo thực đơn, thay từng món, ký hợp đồng điện tử rồi thanh toán đặt cọc 50%.
- Admin: dashboard, người dùng, gói cưới, combo/món ăn, danh mục, hợp đồng, capacity, thanh toán, phân ca, ảnh, hư hại, đơn giá, bảng công, FAQ và audit log.
- Gallery gói cưới: nhiều ảnh, ảnh bìa, sắp xếp, upload local/Cloudinary và trình xem toàn màn hình.
- Staff: ca hôm nay, lịch làm việc, chỉ đường, ảnh trước/sau, check-in/out, báo hư hại và bảng công cá nhân.
- Backend: JWT, refresh token, RBAC, Zod, rate limit, transaction, kiểm tra quyền sở hữu và xử lý lỗi tập trung.
- Tích hợp: OpenAI Responses API, Google Maps, payOS, Casso webhook và Cloudinary.

## Cấu trúc thư mục

```text
wedding-management-system/
├── frontend/          React + Vite
├── backend/           Express + Prisma
├── backend/prisma/    Schema, migration và seed
├── docs/              Tài liệu kiến trúc và ERD
├── nginx/             Reverse proxy
└── docker-compose.yml
```

## Yêu cầu môi trường

- Node.js 20 trở lên.
- npm 10 trở lên.
- MySQL 8 trở lên, hoặc Docker Desktop.

## Chạy local

Mở PowerShell tại thư mục `wedding-management-system`:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Địa chỉ sau khi chạy:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Health check: `http://localhost:4000/api/health`

MySQL phải đang chạy và thông tin trong `DATABASE_URL` phải đúng trước khi migrate.

## Chạy bằng Docker

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Mở `http://localhost:8080`. Backend tự chạy migration và seed sau khi MySQL đạt trạng thái khỏe.

Dừng hệ thống mà vẫn giữ dữ liệu:

```powershell
docker compose down
```

Không dùng `docker compose down -v` nếu muốn giữ dữ liệu MySQL.

## Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@example.com` | `Wedding@123` |
| Staff | `staff1@example.com` | `Wedding@123` |
| Staff | `staff2@example.com` | `Wedding@123` |
| Customer | `customer@example.com` | `Wedding@123` |

Hãy đổi mật khẩu và secret trước khi dùng ngoài môi trường phát triển.

## Cấu hình API bên ngoài

Ứng dụng vẫn chạy khi chưa có các khóa này. Những phần chưa cấu hình sẽ hiển thị trạng thái rõ ràng.

### OpenAI

Điền trong `backend/.env` hoặc `.env` khi chạy Docker:

```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=
```

Chatbot gọi Responses API ở backend, nạp context trực tiếp từ gói cưới, combo thực đơn và dữ liệu hợp đồng/thanh toán của khách đang đăng nhập. Khi AI tạm lỗi, backend dùng bộ nhận diện ý định và fallback dữ liệu MySQL; chatbot không dùng bảng FAQ làm nguồn trả lời. Kịch bản prompt nằm ở `docs/CHATBOT_PROMPT.md`.

### Google Maps

```dotenv
VITE_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_KEY=
```

Giới hạn browser key theo domain trong Google Cloud Console. Địa chỉ văn bản luôn bắt buộc nên tạo hợp đồng vẫn hoạt động khi chưa có key.

### payOS

```dotenv
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

Khách hàng có thể mở trang thanh toán payOS sau khi ký hợp đồng. Backend xác thực webhook tại `/api/payments/payos/webhook`; khi chạy local có thể dùng nút đồng bộ trạng thái vì dịch vụ bên ngoài không gọi được vào `localhost`.

Hướng dẫn đăng ký và kiểm tra webhook: [`docs/PAYOS_WEBHOOK.md`](docs/PAYOS_WEBHOOK.md).

### Casso Flow

```dotenv
CASSO_API_KEY=
CASSO_WEBHOOK_SECRET=
CASSO_ACCOUNT_NUMBER=
CASSO_ACCOUNT_NAME=
CASSO_BANK_NAME=
```

## Thông tin Green Wedding

- Địa chỉ: Điện Bàn Bắc, Đà Nẵng.
- Điện thoại: `0799392717`.
- Đại diện ký hợp đồng: Huỳnh Trần Sơn Sanh.
- Tiền đặt cọc mặc định: 50% sau khi Customer ký điện tử.

Webhook local:

```text
POST http://localhost:4000/api/payments/casso/webhook
```

Webhook Docker:

```text
POST http://<ten-mien>/api/payments/casso/webhook
```

Backend hỗ trợ `secure-token`, `x-secure-token`, `x-casso-signature` hoặc `x-signature`. Hãy đối chiếu tên header với cấu hình webhook Casso thực tế trước khi đưa vào production.

### Cloudinary

```dotenv
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Nếu chưa có Cloudinary, ảnh được lưu trong thư mục `backend/uploads` khi chạy local hoặc volume `uploads_data` khi chạy Docker.

## Lệnh database

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

- `db:generate`: tạo Prisma Client.
- `db:migrate`: áp dụng migration ở môi trường phát triển.
- `db:seed`: tạo role, tài khoản, gói cưới, danh mục, đơn giá và dữ liệu tham khảo hệ thống.

### Tạo database bằng một file SQL

Nếu dùng MySQL Workbench, mở và chạy toàn bộ file:

```text
database/wedding_management_full.sql
```

File này tự tạo database `wedding_management`, 27 bảng, toàn bộ khóa ngoại và dữ liệu mẫu. Hướng dẫn chi tiết nằm tại [database/README.md](database/README.md).

## Kiểm tra dự án

```powershell
npm run lint
npm test
npm run build
```

## API mẫu

Đăng nhập:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "Wedding@123"
}
```

Response rút gọn:

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "role": { "code": "CUSTOMER" } },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

Tạo hợp đồng:

```http
POST /api/contracts
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "packageId": "<packageId>",
  "tableCount": 20,
  "setupDate": "2026-12-19T08:00:00.000Z",
  "eventDate": "2026-12-20T10:00:00.000Z",
  "hostName": "Nguyễn Văn A",
  "hostPhone": "0799392717",
  "address": "Điện Bàn Bắc, Đà Nẵng",
  "items": []
}
```

Gửi tin nhắn chatbot:

```http
POST /api/chatbot/conversations/<conversationId>/messages
Authorization: Bearer <accessToken>
Content-Type: application/json

{ "message": "Gói nào phù hợp với 20 bàn?" }
```

## Nhóm API

| Nhóm | Prefix |
| --- | --- |
| Xác thực | `/api/auth` |
| Người dùng | `/api/users` |
| Gói cưới | `/api/packages` |
| Danh mục | `/api/catalog-items` |
| Hợp đồng | `/api/contracts` |
| Thanh toán | `/api/payments` |
| Capacity | `/api/capacity` |
| Phân ca | `/api/assignments` |
| Ảnh/hư hại | `/api/photos`, `/api/damages` |
| Bảng công | `/api/payroll` |
| Chatbot/FAQ | `/api/chatbot` |
| Dashboard | `/api/admin/dashboard` |
| Thông báo/audit | `/api/notifications`, `/api/audit-logs` |

## Lỗi thường gặp

### Không kết nối được MySQL

Kiểm tra MySQL đã chạy, database đã tồn tại và `DATABASE_URL` đúng. Với local, host thường là `localhost`; trong Docker, host là `mysql`.

### Prisma báo chưa có bảng

```powershell
npm run db:migrate
npm run db:seed
```

### Google Maps không hiển thị

Kiểm tra `VITE_GOOGLE_MAPS_API_KEY`, bật Maps JavaScript API, Places API và giới hạn đúng domain. Sau khi đổi biến Vite cần build lại frontend.

### Chatbot không trả lời được

Kiểm tra `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` và khởi động lại backend. Khi AI tạm lỗi, chatbot vẫn phải trả lời từ dữ liệu gói cưới, combo, hợp đồng và thanh toán trong MySQL.

### Webhook không được xác thực

Kiểm tra `CASSO_WEBHOOK_SECRET` trùng với secure token cấu hình tại Casso và reverse proxy có giữ nguyên header.

## Checklist triển khai production

- Đổi `JWT_SECRET`, `JWT_REFRESH_SECRET` và mật khẩu tài khoản seed.
- Dùng HTTPS.
- Giới hạn Google Maps browser key theo domain.
- Cấu hình Cloudinary hoặc storage bền vững.
- Cấu hình URL webhook Casso công khai qua HTTPS.
- Không commit `.env`.
- Chạy `npm run lint`, `npm test` và `npm run build`.
- Sao lưu MySQL trước khi áp dụng migration mới.

Tài liệu kiến trúc và ERD nằm tại [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Danh sách endpoint và quyền truy cập nằm tại [docs/API.md](docs/API.md).
