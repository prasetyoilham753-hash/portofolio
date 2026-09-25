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
  const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID || firebaseConfig.measurementId || "").trim();

  if (measurementId) {
    // 1. Ensure measurementId is configured on Firebase App options for SDK compatibility
    if (!app.options.measurementId) {
      (app.options as any).measurementId = measurementId;
    }

    // 2. Initialize official Google tag (gtag.js) for robust GA4 collection on custom domain
    try {
      if (!document.getElementById("ga-gtag-script")) {
        const script = document.createElement("script");
        script.id = "ga-gtag-script";
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.appendChild(script);

        const win = window as any;
        win.dataLayer = win.dataLayer || [];
        function gtag(...args: any[]) {
          win.dataLayer.push(arguments);
        }
        win.gtag = win.gtag || gtag;
        win.gtag("js", new Date());
        win.gtag("config", measurementId, {
          send_page_view: false, // SPA page views are cleanly dispatched by AppLayout router navigation
        });
      }
    } catch {
      // Non-blocking fallback
    }

    // 3. Initialize Firebase Analytics instance if supported
    isSupported().then((supported) => {
      if (supported) {
        try {
          analyticsInstance = getAnalytics(app);
        } catch {
          // Gracefully fallback to window.gtag
        }
      }
    }).catch(() => {
      // Gracefully continue with window.gtag
    });
  }
}

export const logAnalyticsEvent = (eventName: string, eventParams?: Record<string, any>) => {
  // Dispatch to Firebase Analytics
  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, eventName, eventParams);
    } catch {
      // Silently continue to gtag
    }
  }
  // Dispatch to Google tag (gtag.js)
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
