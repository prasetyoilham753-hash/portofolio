import React, { useEffect, useState } from "react";
import { getProfile } from "../../features/profile/api";
import { SiteProfile } from "../../features/profile/types";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { FeaturedProjects } from "./components/FeaturedProjects";
import { Footer } from "./components/Footer";

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

  // Apply subtle background animation dynamically
  useEffect(() => {
    // Ensuring reduced motion users don't get the moving bg
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let rafId: number;
    let startTime = performance.now();
    
    const animate = (time: number) => {
      const elapsed = time - startTime;
      const x1 = 75 + Math.sin(elapsed * 0.0002) * 5;
      const y1 = 20 + Math.cos(elapsed * 0.00015) * 5;
      const x2 = 15 + Math.cos(elapsed * 0.00018) * 5;
      const y2 = 70 + Math.sin(elapsed * 0.00025) * 5;
      
      document.body.style.background = `
        /* Diagonal Streaks */
        linear-gradient(135deg, rgba(91, 140, 255, 0.03) 0%, transparent 40%),
        linear-gradient(315deg, rgba(139, 124, 255, 0.02) 0%, transparent 40%),
        /* Moving Glows */
        radial-gradient(circle at ${x1}% ${y1}%, rgba(55, 120, 255, 0.15), transparent 45%),
        radial-gradient(circle at ${x2}% ${y2}%, rgba(139, 124, 255, 0.08), transparent 45%),
        #020914
      `;
      document.body.style.backgroundAttachment = 'fixed';
      
      rafId = requestAnimationFrame(animate);
    };
    
    rafId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.background = '';
    };
  }, []);

  return (
    <div className="flex flex-col pt-16">
      <Hero profile={profile} />
      <About profile={profile} />
      <FeaturedProjects />
      <Footer profile={profile} />
    </div>
  );
}
