# AppReading Mobile App

Day la phan frontend cua du an AppReading, duoc xay dung bang Expo Router va React Native. Ung dung phuc vu cac luong chinh nhu dang nhap, xem truyen, doc chuong, binh luan, chat cong dong, nap Stone va khu vuc admin.

## Yeu cau

- Node.js 18+
- npm 9+
- Expo CLI hoac `npx expo`

## Cai dat

```bash
npm install
```

## Chay du an

```bash
npm run start
```

Lenh nay mo Expo dev server. Tu day ban co the chon:

- `a`: mo Android emulator
- `w`: mo web
- quet QR de chay bang Expo Go

Hoac chay truc tiep:

```bash
npm run android
npm run web
```

## Bien moi truong

App doc API URL tu bien:

```env
EXPO_PUBLIC_API_URL=https://app-reading-backend.onrender.com/api
```

Hay dam bao backend dang chay va bien nay trung voi cong backend that su ban dang dung.

## Kiem tra chat luong

```bash
npm run lint
npm run typecheck
```

## Build

App da co cau hinh EAS Build:

```bash
eas build --platform android --profile preview
eas build --platform android --profile production
```

## Cau truc thu muc chinh

- `app/`: cac man hinh theo Expo Router.
- `components/`: UI component tai su dung.
- `context/`: auth, theme, toast va state dung chung.
- `services/`: cac ham goi API va xu ly du lieu.
- `assets/`: icon, splash, hinh anh.

## Luu y

- Admin screen hien nam trong ung dung nay tai `app/admin`.
- Chat realtime su dung Socket.IO.
- Thanh toan top-up su dung luong mo phong VNPay sandbox.
- README tong the cua toan du an nam o thu muc goc: `../README.md`.
