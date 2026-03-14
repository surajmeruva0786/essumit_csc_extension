# Firebase Setup for CSC Extension

The extension saves session/activity data to Firebase Firestore, and the dashboard displays it.

## 1. Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/) → your project `csc-extension`
2. Create a Firestore database if not already created (Native mode)
3. Deploy security rules:

```bash
# From project root
firebase deploy --only firestore:rules
```

Or copy the rules from `firestore.rules` into Firebase Console → Firestore → Rules.

**Rules** (development - allow all; restrict in production):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read, write: if true;
    }
  }
}
```

## 2. Firestore Index (optional)

For `orderBy('timestamp')` on the `sessions` collection, Firestore creates single-field indexes automatically. No composite index needed for the current queries.

## 3. Operator ID (optional)

To associate sessions with an operator in the dashboard, set the operator ID in the extension. Add to `chrome.storage.local` with key `csc_operator_id` and value like `CSC-MH-001`. You can do this via the browser console when the extension context is available, or add a Settings screen in the extension UI.

## 4. Extension build

Rebuild the extension after Firebase integration:

```bash
cd extension_frontend && npm run build
```

## 5. Dashboard

The dashboard fetches sessions from Firestore. Ensure the dashboard is served from a domain that Firebase allows (or use localhost for development). Run:

```bash
cd csc_extension_dashboard_frontend && npm run dev
```
