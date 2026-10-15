# JaJu Boutique

Website bán hàng tĩnh, chạy trên GitHub Pages: https://sucalb.github.io/JaJuBoutique/

## Cấu trúc

- `index.html`, `assets/js/app.js`, `assets/css/style.css`: trang bán hàng.
- `data/store.js`: toàn bộ nội dung cửa hàng (sản phẩm, danh mục, banner, mã giảm giá, bài viết, thông tin liên hệ, màu sắc).
- `admin.html`, `assets/js/admin.js`, `assets/css/admin.css`: trang quản trị.
- `assets/img/products/demo-*.webp`: ảnh minh họa tạm lấy từ DummyJSON, cần thay bằng ảnh thật của shop.

## Trang quản trị

Mở https://sucalb.github.io/JaJuBoutique/admin.html, mật khẩu mặc định `jaju2026` (đổi ở mục Thông tin cửa hàng).

1. Sửa nội dung ở các mục bên trái. Thay đổi được lưu nháp tự động trong trình duyệt.
2. Bấm **Xem trước** để xem website với bản nháp.
3. Bấm **Xuất bản**: trang quản trị ghi `data/store.js` và ảnh mới tải lên (`assets/img/uploads/`) vào repo bằng GitHub API, GitHub Pages cập nhật sau khoảng 1 phút.

Lần đầu xuất bản trên mỗi máy cần nhập token ở mục **Xuất bản → Kết nối GitHub**:
GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → chọn repo `JaJuBoutique`, quyền **Contents: Read and write**. Token chỉ lưu trong trình duyệt của máy đó.

Mật khẩu trang quản trị chỉ chặn người xem tò mò; quyền sửa website thật sự nằm ở token GitHub.

## Chưa có

- Đơn hàng chưa được gửi đi đâu (cần nối email, Google Sheet hoặc dịch vụ form).
