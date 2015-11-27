set zip_align_path=C:\Users\guillaume\AppData\Local\Android\android-sdk\build-tools\22.0.1\zipalign.exe
set "version = 22.0.1"

del "production.apk"

CALL cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore 	production.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
"%zip_align_path%" -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk production.apk