# Finance Tracker

A minimal personal finance tracker built with **Angular 18** and **Firebase** (Firestore + Authentication).

## Features

- **Email/password authentication** via Firebase Auth
- **Daily entries** — log income and expenses, auto-calculates net income
- **Dashboard** — view/edit today's entry
- **History** — all entries sorted newest first, weekly income total
- **Monthly summary** — current month stats + archived past months

## Setup

### 1. Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Enable **Authentication** → **Email/Password** sign-in method
3. Create a **Firestore Database** (start in test mode or set up rules below)
4. Go to **Project Settings** → **Your apps** → **Web app** and copy the config

### 2. Configure Environment

Edit `src/environments/environment.ts` with your Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-project.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: 'your-sender-id',
    appId: 'your-app-id',
  },
};
```

Do the same for `src/environments/environment.prod.ts` with your production values.

### 3. Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run Locally

```bash
npm install
ng serve
```

Open http://localhost:4200

## Deploy to Vercel

1. Push to a Git repository
2. Import in [Vercel](https://vercel.com/)
3. Before deploying, update `src/environments/environment.prod.ts` with your production Firebase config
4. Vercel will auto-detect the `vercel.json` configuration

## Project Structure

```
src/app/
├── firebase.ts                  # Firebase initialization
├── models/
│   └── entry.model.ts           # Entry interface
├── services/
│   ├── auth.service.ts          # Firebase Auth service
│   └── entry.service.ts         # Firestore CRUD service
├── guards/
│   └── auth.guard.ts            # Route guard
├── pages/
│   ├── login/                   # Login/Register page
│   ├── dashboard/               # Today's entry
│   ├── history/                 # All entries table
│   └── monthly/                 # Monthly summaries
├── app.component.ts             # Shell with navigation
├── app.config.ts                # App providers
└── app.routes.ts                # Route definitions
```
