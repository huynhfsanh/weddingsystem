# Kiến trúc hệ thống

## Tổng quan

Hệ thống sử dụng mô hình nhiều lớp:

1. React/Vite cung cấp giao diện Public, Customer, Admin và Staff.
2. Express cung cấp REST API, xác thực JWT, RBAC và validation bằng Zod.
3. Service xử lý giá, capacity, xung đột lịch, đối soát thanh toán và chatbot.
4. Prisma truy cập MySQL bằng khóa ngoại, chỉ mục và transaction.
5. Integration kết nối OpenAI, Google Maps, payOS, Casso và Cloudinary khi có cấu hình.

## ERD

```mermaid
erDiagram
  roles ||--o{ users : phan_quyen
  users ||--o{ wedding_contracts : so_huu
  wedding_packages ||--o{ wedding_contracts : duoc_chon
  menu_combos ||--o{ menu_dishes : gom_mon
  menu_combos ||--o{ wedding_contracts : duoc_chon
  wedding_contracts ||--o{ contract_menu_items : chot_thuc_don
  menu_dishes ||--o{ contract_menu_items : mon_da_chon
  wedding_contracts ||--o| contract_signatures : ky_dien_tu
  wedding_packages ||--o{ package_catalog_items : bao_gom
  catalog_items ||--o{ package_catalog_items : thuoc_goi
  wedding_contracts ||--o{ contract_items : co
  catalog_items ||--o{ contract_items : tham_chieu
  wedding_contracts ||--o{ contract_payments : thanh_toan
  wedding_contracts ||--o{ staff_assignments : phan_cong
  users ||--o{ staff_assignments : nhan_ca
  staff_rates ||--o{ staff_assignments : chot_don_gia
  staff_assignments ||--o{ assignment_photos : minh_chung
  staff_assignments ||--o{ damage_reports : phat_sinh
  damage_reports ||--o{ damage_cost_items : gom_chi_phi
  users ||--o{ chatbot_conversations : tro_chuyen
  chatbot_conversations ||--o{ chatbot_messages : gom_tin_nhan
  users ||--o{ notifications : nhan
```

## Quy tắc nghiệp vụ quan trọng

- Backend luôn tính lại giá từ `wedding_packages` và `catalog_items`; không tin tổng tiền từ frontend.
- Mọi hợp đồng mới phải chọn một combo. Các món thay thế được lưu snapshot trong `contract_menu_items` để không bị đổi theo danh mục về sau.
- `selectedPackageItemIds` là các hạng mục trong gói mà khách giữ lại; hạng mục bỏ chọn được backend tính thành khoản giảm giá, không tin tổng tiền frontend.
- Customer phải ký điện tử trước khi thanh toán đặt cọc; chữ ký lưu URL ảnh, thời gian, IP và hash SHA-256 nội dung hợp đồng.
- Một ngày chỉ nhận số hợp đồng tối đa theo `daily_capacities` hoặc giá trị mặc định.
- Phân ca chạy trong transaction mức `Serializable` và kiểm tra cả khoảng đệm di chuyển.
- Check-in cần ảnh `BEFORE_SETUP`; check-out cần ảnh `AFTER_SETUP`.
- Bảng công chỉ tính ca `COMPLETED` có cả `actualCheckin` và `actualCheckout`.
- Webhook payOS và Casso lưu `externalEventId` duy nhất để chống xử lý lặp; payOS còn có API đồng bộ trạng thái dùng cho môi trường local.
- Chatbot chỉ nhận context gói cưới và FAQ cần thiết, không nhận mật khẩu, token hoặc secret.

## Luồng đặt tiệc

```mermaid
sequenceDiagram
  participant C as Customer
  participant F as Frontend
  participant A as Express API
  participant D as MySQL
  participant P as payOS/Casso
  C->>F: Chọn gói, dịch vụ, ngày và địa chỉ
  F->>A: POST /api/contracts
  A->>D: Kiểm tra capacity và đọc giá
  A->>D: Transaction tạo hợp đồng + yêu cầu cọc
  A-->>F: Hợp đồng và nội dung chuyển khoản
  P->>A: Webhook giao dịch đã ký
  A->>D: Chống trùng, đối soát, cập nhật hợp đồng
  A-->>C: Thông báo trạng thái thanh toán
```

## Phân quyền

| Vai trò | Phạm vi chính |
| --- | --- |
| CUSTOMER | Gói cưới, hợp đồng của mình, thanh toán, chatbot, thông báo |
| STAFF | Ca được giao, ảnh hiện trường, check-in/out, hư hại, bảng công cá nhân |
| ADMIN | Toàn bộ dữ liệu vận hành, duyệt, điều phối, báo cáo và audit log |

Mọi API riêng tư đều kiểm tra JWT và vai trò ở backend. Các truy vấn hợp đồng, thanh toán, ca làm việc và báo cáo còn kiểm tra quyền sở hữu để ngăn IDOR.
