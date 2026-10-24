import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { initializeAnalytics, getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import firebaseConfig from '../../../firebase-applet-config.json';

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const isLocalOrPreview =
  typeof window !== "undefined" &&
  (import.meta.env.DEV ||
    window.location.hostname.includes("run.app") ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

// Initialize Firebase App Check (reCAPTCHA Enterprise) BEFORE Firestore & Auth
// so initial database/auth requests always attach a valid App Check token
const recaptchaKey = (
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
  firebaseConfig.recaptchaSiteKey ||
  "6LdZv8otAAAAAPTPQRh6hK0osf9kbyGwj_dhIhv7"
).trim();
const debugToken = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN?.trim();

if (typeof window !== "undefined" && recaptchaKey) {
  try {
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

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Initialize Google Analytics (GA4) / Firebase Analytics safely on production domains only
// (Prevents polluting production analytics and avoids tracking-blocker fetch errors in preview iframes)
export let analyticsInstance: any = null;
if (typeof window !== "undefined" && !isLocalOrPreview) {
  const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID || firebaseConfig.measurementId || "G-RM6XBW359Y").trim();

  if (measurementId) {
    if (!app.options.measurementId) {
      (app.options as any).measurementId = measurementId;
    }

    const win = window as any;
    win.dataLayer = win.dataLayer || [];
    function gtag(...args: any[]) {
      win.dataLayer.push(arguments);
    }
    if (!win.gtag) {
      win.gtag = gtag;
    }

    isSupported().then((supported) => {
      if (supported) {
        try {
          analyticsInstance = initializeAnalytics(app, {
            config: {
              send_page_view: false,
            },
          });
        } catch {
          try {
            analyticsInstance = getAnalytics(app);
          } catch {
            // Gracefully continue
          }
        }
      }
    }).catch(() => {
      // Gracefully continue
    });
  }
}

export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (isLocalOrPreview) return;

  // 1. Dispatch through Firebase Analytics if initialized (it internally forwards to gtag)
  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, eventName, eventParams);
      return;
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

// Deferred connection check to avoid blocking the initial critical rendering path
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase Connection Notice: offline mode active.");
    }
  }
}

if (typeof window !== "undefined") {
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => {
      void testConnection();
    });
  } else {
    setTimeout(() => {
      void testConnection();
    }, 3500);
  }
}

