import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Initialize Firebase App Check (reCAPTCHA Enterprise)
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdZv8otAAAAAPTPQRh6hK0osf9kbyGwj_dhIhv7";
const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN;

if (typeof window !== "undefined" && recaptchaKey) {
  try {
    const isLocalOrPreview =
      import.meta.env.DEV ||
      window.location.hostname.includes("run.app") ||
      window.location.hostname === "localhost";

    if (isLocalOrPreview) {
      // @ts-ignore
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken || true;
    }

    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(recaptchaKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn("Firebase App Check initialization:", err);
  }
}

// Test connection on boot to catch configuration errors
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase Connection Error: Please check your configuration or network.");
    }
  }
}
testConnection();
