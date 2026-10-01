# Tổng quan dự án

Đây là hệ thống web responsive của Green Wedding tại Điện Bàn Bắc, Đà Nẵng, quản lý dịch vụ tiệc cưới trọn gói, thực đơn, hợp đồng điện tử, thanh toán, điều phối nhân sự và chatbot tư vấn.

# Công nghệ sử dụng

- Frontend: React, TypeScript, Vite, TailwindCSS, TanStack Query, React Router, Recharts.
- Backend: Node.js, Express, TypeScript, Zod, JWT, Prisma.
- Cơ sở dữ liệu: MySQL 8.
- Tích hợp tùy chọn: OpenAI Responses API, Google Maps, payOS, Casso Flow và Cloudinary.

# Kiến trúc

- `frontend/src/pages`: màn hình theo vai trò.
- `frontend/src/layouts`: layout Public và Dashboard.
- `backend/src/routes`: REST API và kiểm tra quyền.
- `backend/src/services`: nghiệp vụ dùng chung.
- `backend/src/repositories`: truy vấn dữ liệu có thể tái sử dụng.
- `backend/prisma/schema.prisma`: mô hình dữ liệu chuẩn.

# Trạng thái hiện tại

- Đã có đầy đủ nền tảng xác thực, RBAC, gói cưới, hợp đồng, capacity, thanh toán, phân ca, ảnh, hư hại, lương, chatbot, thông báo và audit.
- Cloudinary và payOS đã được cấu hình trong môi trường local. Lưu ảnh local vẫn là chế độ thay thế khi Cloudinary không hoạt động.
- Seed tạo bốn tài khoản demo với mật khẩu `Wedding@123`.

# Vấn đề đã biết

- Docker Desktop chưa chạy trong lần kiểm tra ngày 2026-09-25 nên chưa kiểm thử container thực tế; `docker compose config` đã hợp lệ.
- OpenAI-compatible endpoint shupremium và Google Maps đã có cấu hình local; các nhánh fallback vẫn hoạt động.
- Khóa bảo mật webhook Casso Flow chưa được cấu hình. Bộ `client id / API key / checksum key` hiện tại thuộc payOS và đã được tích hợp đúng theo SDK chính thức.
- Webhook bên ngoài không thể gọi trực tiếp vào `localhost`; màn thanh toán có nút đồng bộ trạng thái payOS làm phương án local.

# Quyết định kiến trúc

- Giá và trạng thái thanh toán chỉ được quyết định ở backend.
- Mức cọc mặc định là 50%; hợp đồng phải ký điện tử trước khi xác nhận cọc.
- Hợp đồng đã ký không cho sửa trực tiếp nội dung; thay đổi phải xử lý bằng phụ lục mới để không làm sai hash chữ ký.
- Ảnh không lưu BLOB trong MySQL.
- Không hard-code model OpenAI; dùng `OPENAI_MODEL`.
- Địa chỉ văn bản luôn bắt buộc ngay cả khi Google Maps chưa được cấu hình.

# Nhật ký thay đổi

- 2026-09-25: Khởi tạo toàn bộ kiến trúc, database, API, ba portal, test và Docker.
- 2026-09-25: Bổ sung file `database/wedding_management_full.sql` để khởi tạo MySQL và seed dữ liệu bằng MySQL Workbench.
- 2026-09-25: Sửa kết nối frontend/backend khi truy cập bằng `127.0.0.1` hoặc địa chỉ LAN; API tự dùng hostname hiện tại và CORS development chấp nhận mạng riêng.
- 2026-09-25: Sửa luồng phiên đăng nhập cũ và điều hướng sai vai trò; ứng dụng xác minh `/auth/me`, tự xóa token hết hạn, hiển thị tài khoản/đăng xuất và cho phép đổi tài khoản tại trang 403.
- 2026-09-25: Hoàn thiện quản trị CRUD cho người dùng, gói cưới và hạng mục trong gói, danh mục, hợp đồng theo trạng thái, thanh toán, capacity, phân công, ảnh, hư hại, đơn giá, FAQ và yêu cầu hỗ trợ. Dữ liệu tài chính/pháp lý dùng xóa mềm hoặc trạng thái.
- 2026-09-25: Tách `CustomerLayout` khỏi dashboard vận hành. Customer sau đăng nhập dùng giao diện website cưới với header ngang, ảnh cưới, menu tài khoản/mobile và trang tổng quan cá nhân hóa; Admin/Staff tiếp tục dùng sidebar nghiệp vụ.
- 2026-09-25: Bổ sung `package_images`, gallery responsive và trình xem toàn màn hình ở trang chi tiết gói. Admin có thể upload file/dùng URL, sửa mô tả và thứ tự, đặt ảnh bìa hoặc xóa; file storage được dọn cùng bản ghi.
- 2026-09-26: Đổi thương hiệu thành Green Wedding, địa chỉ Điện Bàn Bắc, Đà Nẵng và số điện thoại 0799392717. Thêm 15 combo/113 món, thay món theo combo, hợp đồng 7 điều, cọc 50% và chữ ký điện tử Customer; đại diện công ty ký sẵn “Sanh - Huỳnh Trần Sơn Sanh”.
- 2026-09-27: Nâng cấp Admin Dashboard thành trung tâm điều hành với KPI, doanh thu, trạng thái hợp đồng, lịch tiệc 45 ngày, thanh toán chờ xử lý, ca sắp diễn ra, hoạt động gần đây và lối tắt vận hành.
- 2026-09-27: Sửa lỗi Frontend dev chạy nhiều cổng và gọi nhầm `/api` tương đối; khi phát triển, Axios tự trỏ về Backend cổng 4000 nếu `VITE_API_URL` là đường dẫn tương đối.
- 2026-09-27: Gộp các mục thực phẩm cũ thành `Đồ ăn và thức uống`, cho phép bỏ hạng mục trong gói để backend tự trừ chi phí; bỏ khu vực dịch vụ bổ sung khỏi form Customer. Admin PDF hiển thị cùng mẫu hợp đồng điện tử.
- 2026-09-30: Xác minh và sửa luồng Admin Dashboard `/api/admin/dashboard/overview`; frontend development tự gọi Backend cổng 4000 và bản chạy đúng dùng cổng 5176.
- 2026-09-30: Thêm upload/preview ảnh món ăn trong Admin bằng Cloudinary hoặc storage local; hỗ trợ URL ảnh và file JPG/PNG/WebP.
- 2026-09-30: Tích hợp SDK `@payos/node`, tạo liên kết thanh toán, xác thực webhook, chống lặp và đồng bộ trạng thái thủ công; giữ webhook Casso Flow độc lập.
- 2026-09-30: Sửa webhook payOS để payload thử có chữ ký hợp lệ nhận `200`, bổ sung lệnh `npm run payos:webhook` đăng ký URL HTTPS bằng SDK chính thức và tài liệu `docs/PAYOS_WEBHOOK.md`.
- 2026-09-30: Sửa lỗi ký điện tử khi Cloudinary trả `403`; tầng lưu ảnh tự động chuyển sang `backend/uploads` để chữ ký, ảnh món và ảnh hiện trường vẫn hoạt động.
- 2026-09-30: Thay logo biểu tượng trái tim bằng ảnh thương hiệu `frontend/src/assets/green-wedding-logo.jpg` thông qua component dùng chung `frontend/src/components/brand/BrandLogo.tsx` ở public, customer, admin/staff và auth.
- 2026-10-01: Cấu hình chatbot với `gpt-4o-mini`, prompt tư vấn Green Wedding có quy tắc dữ liệu/an toàn/thanh toán và nạp thêm context combo thực đơn; hướng dẫn được lưu ở `docs/CHATBOT_PROMPT.md`.
- 2026-10-01: Chatbot không còn dùng FAQ để trả lời; bổ sung nhận diện ý định/từ khóa và fallback từ dữ liệu MySQL để API hội thoại vẫn hoạt động khi AI lỗi.
- 2026-10-01: Chatbot gửi ảnh gói cưới/món ăn theo câu hỏi, lưu media ở `chatbot_messages.media`, hiển thị ảnh trong Customer và hiển thị tin nhắn người dùng ngay lập tức trong lúc AI xử lý.
- 2026-10-01: Hỗ trợ `OPENAI_BASE_URL` cho máy chủ OpenAI-compatible; cấu hình local hiện trỏ tới endpoint shupremium và vẫn giữ model `gpt-4o-mini`.
