set zip_align_path=C:\Users\guillaume\AppData\Local\Android\android-sdk\build-tools\22.0.1\zipalign.exe
set "version = 22.0.1"

del "production.apk"

rem cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore 	.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk production
"%zip_align_path%" -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk production.apk