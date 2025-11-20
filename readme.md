# Cách chạy

## Frontend
- Vào thư mục `frontend/`
- Cài dependencies:
```bash
npm install
npm run dev
```
- Nếu gặp lỗi, sử dụng GPT để tìm giải pháp.

## Backend
- Vào thư mục `backend/`
- Cài dependencies:
```bash
pip install -r requirements.txt
```

### Kết nối SQL Server
- Xem hướng dẫn: [Thiết lập tài khoản SA trong SQL Server](https://www.youtube.com/watch?v=ftVcBoZRAMA)
- Tài khoản `sa` với mật khẩu `admin123`.
- Sau khi kết nối vào database với tài khoản `sa`, sử dụng lệnh sau để tạo database:
```sql
CREATE DATABASE MajeXDB;
```

- Chạy `main.py` để khởi động server.

### Scripts
- Reset dữ liệu các bảng trong database:
```bash
python reset.py
```
- Khởi tạo dữ liệu mẫu trong database:
```bash
python seed.py
```

- Sau khi chạy cả backend và frontend, truy cập URL hiển thị trên terminal để kiểm tra.

# Các lỗi cần cải thiện
- Không thể trả lời report của resident (không ấn được).
- Upcoming booking của user chưa được cập nhật.
- Không gửi được thông báo đến tất cả (Error saving message: 'senderId'), user không nhận được thông báo từ admin.
- Revenue Overview của admin hiển thị dư thừa, có thể bỏ.
- Facility Booking nên thêm tùy chọn:
  - Loại có available slots theo giờ (như sân bóng, sân cầu lông).
  - Loại không giới hạn theo giờ (như khu vui chơi, bể bơi, quán ăn).
- Các chức năng tải về (như tải PDF hóa đơn) chưa được implement, có thể bỏ.
- Transaction history chưa lưu lại các booking (nhưng đã lưu ở trang Booking và My QR code), có thể bỏ.
- API key error (các chức năng liên quan đến AI đang bị lỗi).