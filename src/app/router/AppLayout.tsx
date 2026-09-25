import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "../../components/Navigation/Navigation";
import { PageTransition } from "../../components/PageTransition/PageTransition";
import { GlobalMoltenBackground } from "../../components/GlobalMoltenBackground";
import { BackgroundProvider } from "../../features/background/BackgroundContext";
import { AnimatePresence } from "motion/react";
import { logAnalyticsEvent } from "../../services/firebase/config";

export default function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    logAnalyticsEvent("page_view", {
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname]);

  return (
    <BackgroundProvider>
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans overflow-x-hidden relative">
        {/* Interactive Dynamic Background Canvas (Molten Metal or Ghost Fibers) */}
        <GlobalMoltenBackground />

        <Navigation />
        
        <main className="flex-grow relative z-10 pb-24 sm:pb-28" style={{ perspective: "1200px" }}>
          <AnimatePresence mode="wait">
            {/* using a div inside AnimatePresence for the key to work correctly if PageTransition doesn't accept key */}
            <div key={location.pathname} className="w-full h-full">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </AnimatePresence>
        </main>
      </div>
    </BackgroundProvider>
  );
}

