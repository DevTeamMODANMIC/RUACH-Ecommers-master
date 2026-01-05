/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_FIREBASE_MEASUREMENT_ID: string
  readonly VITE_FIREBASE_DATABASE_URL: string
  readonly VITE_CLOUDINARY_CLOUD_NAME: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly CLOUDINARY_API_KEY: string
  readonly CLOUDINARY_API_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Fix for date-fns module resolution
declare module 'date-fns' {
  export function formatDistanceToNow(date: Date | number, options?: { addSuffix?: boolean }): string;
}