# 📱 Hướng dẫn Build APK

## 🚀 Bước 1: Chuẩn bị

### 1.1. Kiểm tra đã đăng nhập EAS
```bash
eas whoami
```

Nếu chưa đăng nhập:
```bash
eas login
```

### 1.2. Lấy IP máy tính (nếu backend chạy local)

**Windows:**
```bash
ipconfig
```
Tìm dòng **IPv4 Address** (ví dụ: 192.168.1.103)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### 1.3. Cập nhật API URL

**Cách 1: Tạo file `.env`**
```bash
# Trong thư mục frontend
cp .env.example .env
```

Mở file `.env` và sửa:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.103:3000/api
```
(Thay `192.168.1.103` bằng IP máy tính của bạn)

**Cách 2: Sửa trực tiếp trong `services/api.ts`**
```typescript
// Dòng 29
return 'http://192.168.1.103:3000/api'; // Thay IP này
```

---

## 🔨 Bước 2: Build APK

### Build để Test (Preview)
```bash
cd frontend
eas build --platform android --profile preview
```

**Quá trình này:**
- ⏱️ Mất khoảng 10-20 phút
- ☁️ Build trên server Expo
- 📧 Gửi link download APK qua email
- 📱 File APK khoảng 50-80 MB

### Build Production (cho Google Play)
```bash
eas build --platform android --profile production
```
→ Tạo file AAB thay vì APK

---

## 📲 Bước 3: Cài đặt APK

### 3.1. Tải APK
- Kiểm tra email từ Expo
- Hoặc xem link trong terminal
- Hoặc vào https://expo.dev/accounts/[your-account]/projects/financial-app/builds

### 3.2. Chuyển APK vào điện thoại
- **USB:** Copy trực tiếp
- **Google Drive / Dropbox**
- **Email:** Gửi cho chính mình
- **QR Code:** Quét từ Expo dashboard

### 3.3. Cài đặt
1. Mở file APK trên điện thoại
2. Cho phép "Cài đặt từ nguồn không xác định" (nếu hỏi)
3. Nhấn **Cài đặt**
4. Mở app và test!

---

## ⚙️ Bước 4: Chạy Backend

**Quan trọng:** Backend phải chạy và điện thoại phải truy cập được!

```bash
cd backend
npm run start:dev
```

**Kiểm tra kết nối:**
- Máy tính và điện thoại phải cùng WiFi
- Tắt firewall nếu cần
- Test API bằng browser: `http://192.168.1.103:3000/api`

---

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "Cannot connect to API"
**Nguyên nhân:** Backend không chạy hoặc sai IP

**Giải pháp:**
1. Kiểm tra backend đang chạy
2. Kiểm tra IP trong code
3. Thử tắt firewall
4. Restart app

### Lỗi: "Build failed"
**Giải pháp:**
```bash
# Clear cache và build lại
eas build --platform android --profile preview --clear-cache
```

### Lỗi: "Module not found"
**Giải pháp:**
```bash
cd frontend
rm -rf node_modules
npm install
```

---

## 🎯 Build nhanh hơn (Local Build)

Nếu có Android Studio:

```bash
# Cài dependencies
npm install

# Build APK local
npx expo run:android --variant release

# APK ở đây:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 📝 Checklist trước khi Build

- [ ] Đã đăng nhập EAS: `eas whoami`
- [ ] Backend đang chạy
- [ ] Đã cập nhật API URL (IP máy tính)
- [ ] Đã test trên Expo Go trước
- [ ] Máy tính và điện thoại cùng WiFi

---

## 🚀 Các Profile Build

| Profile | Command | Output | Dùng khi nào? |
|---------|---------|--------|---------------|
| **preview** | `--profile preview` | APK | Test trên điện thoại thật |
| **production** | `--profile production` | AAB | Đưa lên Google Play |
| **development** | `--profile development` | APK | Development build với debugging |

---

## 📞 Cần trợ giúp?

1. Check build status: https://expo.dev
2. Xem logs: `eas build:list`
3. Cancel build: `eas build:cancel`

🎉 **Chúc bạn build thành công!**
