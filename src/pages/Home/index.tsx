import React, { useEffect, useState } from "react";
import { getProfile } from "../../features/profile/api";
import { SiteProfile } from "../../features/profile/types";
import { Hero } from "./components/Hero";
import { About } from "./components/About";

export default function Home() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    }
    fetchProfile();
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
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll('.reveal');
    
    // Slight delay to allow DOM paint
    setTimeout(() => {
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      elements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [profile]); // re-run if profile changes and DOM re-renders

  return (
    <div className="flex flex-col pt-0">
      <Hero profile={profile} />
      <About profile={profile} />
    </div>
  );
}

