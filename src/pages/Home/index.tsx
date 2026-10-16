import React, { useEffect, useState } from "react";
import { getCachedProfile, subscribeToProfile } from "../../features/profile/api";
import { SiteProfile } from "../../features/profile/types";
import { Hero } from "./components/Hero";
import { About } from "./components/About";

export default function Home() {
  // Synchronous cache retrieval ensures 0ms blank state on page load
  const [profile, setProfile] = useState<SiteProfile | null>(() => getCachedProfile());

  useEffect(() => {
    // Realtime subscription automatically hydrates or updates the profile state
    const unsubscribe = subscribeToProfile((updated) => {
      if (updated) {
        setProfile(updated);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal');
    
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [profile]);

  return (
    <div className="flex flex-col pt-0">
      <Hero profile={profile} />
      <About profile={profile} />
    </div>
  );
}
