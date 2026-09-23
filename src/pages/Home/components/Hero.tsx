import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { SiteProfile } from "../../../features/profile/types";
import { ProfileCard3D } from "./ProfileCard3D";

function XIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RedditIcon({ size = 19, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87s-7.004-2.176-7.004-4.87c0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

interface HeroProps {
  profile: SiteProfile | null;
}

export function Hero({ profile }: HeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const clickTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleNameClick = () => {
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
        navigate("/admin");
        return 0;
      }
      return next;
    });

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2500);
  };

  // Safe fallbacks
  const firstName = profile?.firstName || profile?.name?.split(" ")[0] || "Bintang";
  const lastName = profile?.lastName || profile?.name?.split(" ").slice(1).join(" ") || "Prasetyo";
  const fullName = profile?.name || `${firstName} ${lastName}`;
  const role = profile?.title || "Full Stack Developer";
  const description = profile?.heroDescription || profile?.about || "I'm a passionate developer who loves building web applications, exploring new technologies, and turning ideas into real, useful products.";
  
  const photo1 = profile?.photoUrl;
  const photo2 = profile?.photoUrl2;
  const extraPhotos = ((profile as any)?.photos || (profile as any)?.profileImages || []) as string[];
  const photos = [photo1, photo2, ...extraPhotos].filter(Boolean) as string[];

  // Fallback URLs for the 4 social links
  const instagramUrl = profile?.socialLinks?.instagram || "https://instagram.com/bprasety_";
  const xUrl = profile?.socialLinks?.x || profile?.socialLinks?.twitter || "https://x.com/bprasety_";
  const redditUrl = profile?.socialLinks?.reddit || "https://reddit.com/user/bprasety_";
  const linkedinUrl = profile?.socialLinks?.linkedin || "https://linkedin.com/in/bintang-prasetyo";

  const leftColRef = React.useRef<HTMLDivElement>(null);
  const [leftColHeight, setLeftColHeight] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!leftColRef.current) return;
    const updateHeight = () => {
      if (leftColRef.current) {
        const h = leftColRef.current.offsetHeight;
        if (h > 0) setLeftColHeight(h);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(leftColRef.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const socialItems = [
    {
      id: "instagram",
      label: "Instagram",
      url: instagramUrl,
      icon: <Instagram size={19} className="transition-transform group-hover:scale-110" />,
      mobileIcon: <Instagram size={16} />,
    },
    {
      id: "x",
      label: "X (Twitter)",
      url: xUrl,
      icon: <XIcon size={17} className="transition-transform group-hover:scale-110" />,
      mobileIcon: <XIcon size={15} />,
    },
    {
      id: "reddit",
      label: "Reddit",
      url: redditUrl,
      icon: <RedditIcon size={19} className="transition-transform group-hover:scale-110" />,
      mobileIcon: <RedditIcon size={16} />,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: linkedinUrl,
      icon: <Linkedin size={19} className="transition-transform group-hover:scale-110" />,
      mobileIcon: <Linkedin size={16} />,
    },
  ];

  return (
    <section 
      id="hero-section"
      className="grid grid-cols-[175px_1fr] xs:grid-cols-[200px_1fr] sm:grid-cols-[270px_1fr] md:grid-cols-[360px_1fr] lg:grid-cols-[410px_1fr] xl:grid-cols-[440px_1fr] items-stretch justify-start mt-[1cm] pb-12 sm:pb-16 md:pb-[96px] w-full max-w-[620px] xs:max-w-[680px] sm:max-w-[840px] md:max-w-[1320px] lg:max-w-[1460px] xl:max-w-[1540px] mx-auto px-0 sm:px-1 md:px-2 lg:px-4 gap-4 xs:gap-5 sm:gap-7 md:gap-9 lg:gap-12 xl:gap-14 reveal"
    >
      
      {/* Profile Image & Action Area (Card + 4 Social Icons + Download CV Button) */}
      <div 
        ref={leftColRef}
        className="relative mb-0 w-full max-w-[175px] xs:max-w-[200px] sm:max-w-[270px] md:max-w-[360px] lg:max-w-[410px] xl:max-w-[440px] mx-auto md:mx-0 shrink-0 z-10 flex flex-col items-center"
      >
        {/* Profile Card with 3D Fly-In + Flip Animation */}
        <div 
          className="w-full flex justify-center"
          style={{ perspective: "1400px" }}
        >
          <motion.div
            id="hero-profile-fly-flip"
            initial={shouldReduceMotion ? { opacity: 0 } : {
              opacity: 0,
              y: 80,
              scale: 0.82,
              rotateY: 180,
              rotateX: 12,
              filter: "blur(6px)",
            }}
            animate={shouldReduceMotion ? { opacity: 1 } : {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              rotateX: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1.35,
              ease: [0.16, 1, 0.3, 1], // Apple fluid cubic bezier
              delay: 0.08,
            }}
            style={{
              transformStyle: "preserve-3d",
            }}
            className="relative flex justify-center"
          >
            <ProfileCard3D photos={photos} name={fullName} />
          </motion.div>
        </div>

        {/* 4 Social Media Icons (Raised up, matching shape and dimensions of Download CV button) */}
        <motion.div 
          id="hero-social-icons"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.94 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center w-full z-20 mt-2.5 xs:mt-3 sm:mt-3.5 md:mt-4"
        >
          <div className="flex items-center justify-between w-full max-w-[165px] xs:max-w-[190px] sm:max-w-[240px] md:max-w-[270px] h-[38px] xs:h-[42px] sm:h-[46px] md:h-[50px] bg-[rgba(6,15,35,0.75)] border border-[rgba(120,170,255,0.28)] rounded-full px-3 xs:px-4 sm:px-5 md:px-6 backdrop-blur-xl shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-[rgba(140,190,255,0.5)]">
            {socialItems.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ios-glass-icon w-6.5 h-6.5 xs:w-7.5 xs:h-7.5 sm:w-8 sm:h-8 md:w-9 md:h-9 cursor-pointer flex items-center justify-center text-[#A8C8FF] hover:text-white transition-colors"
                aria-label={item.label}
                title={item.label}
              >
                <span className="scale-[0.82] xs:scale-90 sm:scale-95 md:scale-100">{item.mobileIcon || item.icon}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Download CV Button (Positioned underneath the social media icons with identical shape and size) */}
        <motion.div 
          id="hero-download-cv-container"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center w-full z-20 mt-2 xs:mt-2.5 sm:mt-3 md:mt-3.5"
        >
          {profile?.cvUrl ? (
            <a 
              id="hero-download-cv"
              href={profile.cvUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="ios-glass-btn ios-glass-primary w-full max-w-[165px] xs:max-w-[190px] sm:max-w-[240px] md:max-w-[270px] h-[38px] xs:h-[42px] sm:h-[46px] md:h-[50px] px-3 xs:px-4 sm:px-5 md:px-6 text-[11px] xs:text-xs sm:text-sm md:text-base font-medium whitespace-nowrap flex items-center justify-center rounded-full"
            >
              <span>Download CV &rarr;</span>
            </a>
          ) : (
            <button 
              id="hero-download-cv-disabled"
              disabled
              className="ios-glass-btn w-full max-w-[165px] xs:max-w-[190px] sm:max-w-[240px] md:max-w-[270px] h-[38px] xs:h-[42px] sm:h-[46px] md:h-[50px] px-3 xs:px-4 sm:px-5 md:px-6 text-[11px] xs:text-xs sm:text-sm md:text-base font-medium whitespace-nowrap opacity-50 pointer-events-none flex items-center justify-center rounded-full"
            >
              <span>CV Not Available</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Text Content */}
      <div 
        className="flex flex-col items-start text-left mt-0 w-full z-10 min-w-0 h-full overflow-visible"
        style={{
          height: leftColHeight ? `${leftColHeight}px` : undefined,
          maxHeight: leftColHeight ? `${leftColHeight}px` : undefined,
        }}
      >
        <motion.span 
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-[13px] xs:text-[15px] sm:text-[18px] md:text-[21px] lg:text-[23px] text-[#7DB3FF] mb-1 sm:mb-1.5 font-medium tracking-wide pt-0.5 sm:pt-1"
        >
          Hello, I'm
        </motion.span>
        
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, filter: "blur(4px)" }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
        >
          <div 
            onClick={handleNameClick} 
            className="group block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7DB3FF]/50 transition-transform active:scale-[0.99] cursor-default select-none"
            role="heading"
            aria-level={1}
          >
            <h1 className="font-extrabold leading-[1.03] tracking-[-0.03em] flex flex-col text-[26px] xs:text-[32px] sm:text-[46px] md:text-[64px] lg:text-[78px] xl:text-[88px]">
              <span className="text-[#F7FAFF] group-hover:text-white transition-colors">{firstName}</span>
              <span className="text-gradient">{lastName}</span>
            </h1>
          </div>
        </motion.div>
        
        <motion.h2 
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
          className="text-[14px] xs:text-[16px] sm:text-[20px] md:text-[25px] lg:text-[29px] font-semibold text-[#F7FAFF] mt-1 sm:mt-1.5 md:mt-2"
        >
          {role}
        </motion.h2>
        
        <motion.p 
          id="hero-bio-text"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98, filter: "blur(4px)" }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.85, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex-1 min-h-0 max-w-[680px] bg-[rgba(6,15,35,0.45)] border border-[rgba(120,170,255,0.18)] rounded-[20px] sm:rounded-[24px] p-3.5 xs:p-4 sm:p-5 md:p-6 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-[12px] xs:text-[13px] sm:text-[15px] md:text-[16px] lg:text-[17px] text-[#A8B8CC] leading-[1.6] sm:leading-[1.7] mt-2 xs:mt-2.5 sm:mt-3.5 md:mt-4 overflow-hidden break-words [overflow-wrap:anywhere] transition-all duration-300 hover:border-[rgba(140,190,255,0.35)]"
        >
          <span className="whitespace-pre-line block">{description}</span>
        </motion.p>
      </div>
    </section>
  );
}
