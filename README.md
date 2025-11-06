# Huynh Ngoc Ky - SE182995

Ứng dụng React Native Expo để xem danh sách sản phẩm từ FakeStoreAPI với các tính năng:
- Hiển thị danh sách sản phẩm
- Tìm kiếm sản phẩm
- Lọc theo danh mục
- Xem chi tiết sản phẩm
- Thêm/xóa sản phẩm yêu thích
- Lưu trữ offline với AsyncStorage

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm start
```

Hoặc chạy trên thiết bị cụ thể:

```bash
npm run android
npm run ios
```

## Cấu trúc dự án

```
src/
├── App.js                 # Component chính với navigation
├── screens/
│   ├── ListScreen.js      # Màn hình danh sách sản phẩm
│   ├── DetailScreen.js    # Màn hình chi tiết sản phẩm
│   └── FavoritesScreen.js # Màn hình sản phẩm yêu thích
└── services/
    ├── ApiService.js      # Service gọi API FakeStoreAPI
    └── DatabaseService.js # Service lưu trữ local với AsyncStorage
```

## Tính năng

- ✅ Hiển thị danh sách sản phẩm từ FakeStoreAPI
- ✅ Tìm kiếm sản phẩm theo tên và mô tả
- ✅ Lọc sản phẩm theo danh mục
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm/xóa sản phẩm yêu thích
- ✅ Lưu trữ offline với AsyncStorage
- ✅ Xử lý lỗi và hiển thị dữ liệu từ cache khi offline

## Công nghệ sử dụng

- React Native
- Expo SDK 54
- React Navigation
- Axios
- AsyncStorage
- FakeStoreAPI

## Tác giả

Huynh Ngoc Ky - SE182995

