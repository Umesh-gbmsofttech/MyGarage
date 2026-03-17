# MyGarageApp

MyGarage is a comprehensive mobile application designed to connect car owners with mechanics and provide DIY maintenance guides. Users can book various car services, track request statuses, rate mechanics, and access detailed instructions for common vehicle repairs. The app also features separate profiles for vehicle owners and mechanics, ensuring a tailored experience for each user type.

## 📱 Android App

Download the latest signed APK:  
👉 https://github.com/Umesh-gbmsofttech/MyGarage/releases/latest/

> Note: Enable “Install unknown apps” on your Android device.

# Welcome to your MyGarage👋

## 📸 App Screenshots

<p align="center">
  <img src="./screenshots/ownerSignup.jpg" width="250"/>
  <img src="./screenshots/mechanicSignup.jpg" width="250"/>
</p>
<p align="center">
  <img src="./screenshots/Home01.jpg" width="250"/>
  <img src="./screenshots/Home02.jpg" width="250"/>
</p>
<p align="center">
  <img src="./screenshots/doItYourselfVehicleForm.jpg" width="250"/>
  <img src="./screenshots/doItYourselfVehicleFormResult.jpg" width="250"/>
</p>
<p align="center">
  <img src="./screenshots/Bookings.jpg" width="250"/>
  <!-- <img src="./screenshots" width="250"/> -->
</p>

## Using Cron job website to keep alive render hosted server:

1.  https://console.cron-job.org/jobs

## Build Commands

1. Generate Android native files (clean)
```
npx expo prebuild --platform android --clean
```

2. Local APK build (Windows)
```
cd android
.\gradlew.bat clean assembleRelease
```

3. EAS Android build (clear cache)
```
eas build -p android --clear-cache
```

4. EAS iOS build (clear cache)
```
eas build -p ios --clear-cache
```

## GitHub Secrets (Android APK workflow)

Required secrets for `.github/workflows/android-apk.yml`:
- `ANDROID_KEYSTORE_BASE64` - base64 of `release.keystore`
- `MYAPP_UPLOAD_STORE_PASSWORD`
- `MYAPP_UPLOAD_KEY_ALIAS`
- `MYAPP_UPLOAD_KEY_PASSWORD`

Create the base64 value (PowerShell):
```
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android/app/release.keystore"))
```

## Support Chat (Groq AI)

The Support Chat screen uses the backend assistant powered by Groq. Make sure the server is running and configured with `GROQ_API_KEY` (see `myGarage-server/src/main/resources/application.properties`).
