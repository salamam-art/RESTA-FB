RESTA F&B BOOKING - Android Studio Project (Kotlin)
--------------------------------------------------

Included:
- Basic Android project skeleton (Login -> Select Hall -> Booking Form -> Confirmation)
- Google Sheets integration using Google Sign-In and Sheets API
- Colors: gold (#85714D) and burgundy (#6F2C3F)
- Spreadsheet ID already inserted in res/values/strings.xml

IMPORTANT SETUP STEPS (you must do these before running):
1) In Google Cloud Console:
   - Create a project (e.g. RestaBookingApp)
   - Enable Google Sheets API
   - Create OAuth 2.0 Client ID (Android) with your package name and SHA-1
   - Download credentials (client) if needed

2) Place your OAuth credentials JSON (if using a web flow) into:
   app/src/main/res/raw/credentials.json
   (This project expects the user to sign in using Google Sign-In; you must configure OAuth in Cloud Console)

3) In Android Studio:
   - Open the project root folder
   - Build & run on a device/emulator with Google Play services

4) Spreadsheet:
   - A Google Sheet should exist with a sheet named 'Sheet1'
   - First row headers recommended: Hall, Name, Details, Link, Date
   - Spreadsheet ID is already set in res/values/strings.xml
