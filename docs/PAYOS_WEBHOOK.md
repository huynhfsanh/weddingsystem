# Hướng dẫn webhook payOS

## Luồng hoạt động

1. Khách ký hợp đồng điện tử.
2. Frontend gọi `POST /api/payments/:id/payos-link` để tạo trang thanh toán.
3. Khách thanh toán trên payOS.
4. payOS gửi payload có chữ ký tới `POST /api/payments/payos/webhook`.
5. Backend dùng `PAYOS_CHECKSUM_KEY` để xác thực chữ ký, tìm thanh toán bằng `orderCode`, cập nhật tiền đã nhận và trạng thái hợp đồng.
6. Nếu webhook chưa tới khi chạy local, khách có thể dùng nút **Kiểm tra trạng thái**.

## 1. Cấu hình môi trường

Trong `backend/.env`, cấu hình tên biến sau và không đưa giá trị thật lên Git:

```dotenv
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
PAYMENT_WEBHOOK_URL=https://ten-mien-cua-ban/api/payments/payos/webhook
CLIENT_URL=https://ten-mien-frontend-cua-ban
```

`PAYMENT_WEBHOOK_URL` phải là URL HTTPS công khai. payOS không thể gọi `localhost`, `127.0.0.1` hoặc địa chỉ mạng nội bộ.

## 2. Tạo URL công khai

Khi đã triển khai, dùng URL backend thật, ví dụ:

```text
https://api.greenwedding.vn/api/payments/payos/webhook
```

Khi phát triển local, có thể dùng một HTTPS tunnel trỏ về `http://localhost:4000`, sau đó nối thêm đường dẫn:

```text
https://<tunnel-domain>/api/payments/payos/webhook
```

Tunnel phải còn chạy trong suốt thời gian nhận webhook. URL tạm thay đổi thì cần đăng ký lại.

## 3. Đăng ký webhook với payOS

Tại thư mục gốc dự án, chạy:

```powershell
npm run payos:webhook -- https://ten-mien-cua-ban/api/payments/payos/webhook
```

Hoặc đặt `PAYMENT_WEBHOOK_URL` trong `backend/.env`, rồi chạy:

```powershell
npm run payos:webhook
```

Lệnh dùng SDK chính thức `payOS.webhooks.confirm(...)`. payOS sẽ gửi một payload thử; endpoint xác thực chữ ký và trả `200` để hoàn tất đăng ký.

## 4. Kiểm tra

Kiểm tra backend còn hoạt động:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
```

Gửi payload không có chữ ký phải nhận `401`. Đây là kết quả đúng vì webhook giả không được phép cập nhật thanh toán:

```powershell
try {
  Invoke-RestMethod -Method Post -ContentType "application/json" -Body "{}" http://localhost:4000/api/payments/payos/webhook
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Sau khi thanh toán thật, kiểm tra tại Admin > Thanh toán. Giao dịch phải chuyển từ `PENDING` sang `SUCCESS`, `PARTIAL` hoặc `OVERPAID`; hợp đồng đủ tiền cọc chuyển sang `DEPOSITED`.

## 5. Yêu cầu production

- Dùng HTTPS hợp lệ và không chặn request từ payOS.
- Reverse proxy phải chuyển nguyên body JSON tới backend.
- Không tự tính hoặc gửi trạng thái thành công từ frontend.
- Không ghi `PAYOS_CHECKSUM_KEY`, API key hoặc toàn bộ header nhạy cảm vào log.
- Nếu thay kênh thanh toán hoặc URL backend, chạy lại lệnh đăng ký webhook.
