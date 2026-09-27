import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Initialize Google Analytics (GA4) / Firebase Analytics safely
export let analyticsInstance: any = null;
if (typeof window !== "undefined") {
  const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID || firebaseConfig.measurementId || "G-RM6XBW359Y").trim();

  if (measurementId) {
    // 1. Ensure measurementId is configured on Firebase App options for SDK compatibility
    if (!app.options.measurementId) {
      (app.options as any).measurementId = measurementId;
    }

    // 2. Pre-configure dataLayer and gtag function safely without redundant manual script injection
    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    function gtag(...args: any[]) {
      win.dataLayer.push(arguments);
    }
    if (!win.gtag) {
      win.gtag = gtag;
    }

    // 3. Initialize Firebase Analytics instance if supported
    // Firebase Analytics manages gtag.js script loading and configuration as the single source of truth
    isSupported().then((supported) => {
      if (supported) {
        try {
          analyticsInstance = getAnalytics(app);
        } catch {
          // Gracefully continue
        }
      }
    }).catch(() => {
      // Gracefully continue
    });
  }
}

export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  // 1. Dispatch through Firebase Analytics if initialized (it internally forwards to gtag)
  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, eventName, eventParams);
      return; // Event successfully logged via Firebase Analytics; avoid duplicate dispatch
    } catch {
      // Fallback to window.gtag if logEvent encounters an error
    }
  }

  // 2. Fallback to Google tag (gtag.js) only if Firebase Analytics instance is unavailable
  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    try {
      (window as any).gtag("event", eventName, eventParams);
    } catch {
      // Non-blocking
    }
  }
};

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
