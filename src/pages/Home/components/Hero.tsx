import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin, FileText, ArrowRight } from "lucide-react";
import { SiteProfile } from "../../../features/profile/types";

interface HeroProps {
  profile: SiteProfile | null;
}

export function Hero({ profile }: HeroProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // Safe fallbacks
  const firstName = profile?.firstName || profile?.name?.split(" ")[0] || "Bintang";
  const lastName = profile?.lastName || profile?.name?.split(" ").slice(1).join(" ") || "Prasetyo";
  const role = profile?.title || "Full Stack Developer";
  const description = profile?.heroDescription || profile?.about || "I'm a passionate developer who loves building web applications, exploring new technologies, and turning ideas into real, useful products.";
  
  const photo1 = profile?.photoUrl;
  const photo2 = profile?.photoUrl2;
  const photos = [photo1, photo2].filter(Boolean) as string[];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) { // swipe threshold
      if (diff > 0) {
        // swipe left -> next photo
        if (photos.length > 1) {
          setPhotoIndex((prev) => (prev + 1) % photos.length);
        }
      } else {
        // swipe right -> prev photo
        if (photos.length > 1) {
          setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
        }
      }
    }
    touchStartX.current = null;
  };

  const nextPhoto = () => setPhotoIndex(p => (p + 1) % photos.length);
  const prevPhoto = () => setPhotoIndex(p => (p - 1 + photos.length) % photos.length);

  return (
    <section className="flex flex-col md:grid md:grid-cols-[64px_minmax(300px,390px)_minmax(350px,1fr)] items-center md:items-center justify-center md:justify-start pt-[100px] md:pt-[130px] px-5 pb-[70px] max-w-[430px] mx-auto md:max-w-[1120px] lg:max-w-[1200px] gap-8 md:gap-8 lg:gap-[40px] reveal">
      
      {/* Social Links (Desktop Left / Mobile Top or Hidden) */}
      <div className="hidden md:flex flex-col items-center gap-6 z-10 bg-[rgba(5,15,35,0.55)] border border-[rgba(120,160,255,0.35)] rounded-[32px] py-4 px-0 w-[64px] backdrop-blur-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {profile?.socialLinks?.instagram && (
          <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] hover:drop-shadow-[0_0_8px_rgba(91,140,255,0.6)] transition-all" aria-label="Instagram">
            <Instagram size={22} />
          </a>
        )}
        {profile?.socialLinks?.twitter && (
          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] hover:drop-shadow-[0_0_8px_rgba(91,140,255,0.6)] transition-all" aria-label="X / Twitter">
            <Twitter size={22} />
          </a>
        )}
        {profile?.socialLinks?.reddit && (
          <a href={profile.socialLinks.reddit} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] hover:drop-shadow-[0_0_8px_rgba(91,140,255,0.6)] transition-all" aria-label="Reddit">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M15.5 14.5a3.5 3.5 0 0 1-7 0"></path><circle cx="9" cy="11.5" r="1"></circle><circle cx="15" cy="11.5" r="1"></circle></svg>
          </a>
        )}
        {profile?.socialLinks?.linkedin && (
          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] hover:drop-shadow-[0_0_8px_rgba(91,140,255,0.6)] transition-all" aria-label="LinkedIn">
            <Linkedin size={22} />
          </a>
        )}
      </div>

      {/* Profile Image Area */}
      <div className="relative mb-8 md:mb-0 w-full max-w-[320px] md:max-w-none shrink-0 aspect-[4/5] rounded-[32px] border border-[rgba(100,160,255,0.65)] shadow-[0_0_30px_rgba(60,130,255,0.3),0_0_70px_rgba(70,100,255,0.12)] z-10 group">
        <div 
          className="w-full h-full relative touch-pan-y transition-transform duration-[650ms]"
          style={{ 
            transformStyle: "preserve-3d",
            transform: photoIndex === 1 ? "rotateY(180deg)" : "rotateY(0deg)",
            perspective: "1000px"
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {photos.length > 0 ? (
            <>
              {/* Photo 1 */}
              <div 
                className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#0a182a]"
                style={{ backfaceVisibility: "hidden" }}
              >
                <img
                  src={photos[0]}
                  alt={`${name} - Photo 1`}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              
              {/* Photo 2 */}
              {photos.length > 1 && (
                <div 
                  className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden bg-[#0a182a]"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <img
                    src={photos[1]}
                    alt={`${name} - Photo 2`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#0a182a] text-text-muted rounded-[32px]">
              No Photo
            </div>
          )}
        </div>

        {/* Indicators and desktop controls */}
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-20">
            <button 
              onClick={prevPhoto} 
              className="hidden md:flex p-1 text-white/50 hover:text-white transition-colors"
              aria-label="Previous Photo"
            >
              &larr;
            </button>
            <div className="flex gap-1.5 bg-[rgba(5,15,35,0.5)] px-3 py-2 rounded-full backdrop-blur-md border border-[rgba(255,255,255,0.1)]">
              {photos.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === photoIndex ? 'bg-gradient-to-r from-[#5B8CFF] to-[#8B7CFF] w-4' : 'bg-[#71839A]/60 w-1.5'}`}
                />
              ))}
            </div>
            <button 
              onClick={nextPhoto} 
              className="hidden md:flex p-1 text-white/50 hover:text-white transition-colors"
              aria-label="Next Photo"
            >
              &rarr;
            </button>
          </div>
        )}

        {/* Mobile Social Links (Overlaid or below) */}
        <div className="md:hidden absolute -bottom-6 left-0 right-0 flex justify-center z-20">
          <div className="flex gap-5 items-center bg-[rgba(10,24,42,0.6)] border border-[rgba(130,180,255,0.15)] rounded-full px-6 py-3 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            {profile?.socialLinks?.instagram && (
              <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] active:scale-95 transition-all" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            )}
            {profile?.socialLinks?.twitter && (
              <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] active:scale-95 transition-all" aria-label="X / Twitter">
                <Twitter size={20} />
              </a>
            )}
            {profile?.socialLinks?.reddit && (
              <a href={profile.socialLinks.reddit} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] active:scale-95 transition-all" aria-label="Reddit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path><path d="M15.5 14.5a3.5 3.5 0 0 1-7 0"></path><circle cx="9" cy="11.5" r="1"></circle><circle cx="15" cy="11.5" r="1"></circle></svg>
              </a>
            )}
            {profile?.socialLinks?.linkedin && (
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#A8B8CC] hover:text-[#7DB3FF] active:scale-95 transition-all" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex flex-col items-center md:items-start text-center md:text-left mt-10 md:mt-0 w-full z-10">
        <span className="text-[18px] text-[#7DB3FF] mb-2 font-medium">Hello, I'm</span>
        
        <h1 className="font-extrabold leading-[1.0] tracking-[-0.03em] flex flex-col gap-1" style={{ fontSize: 'clamp(46px, 7vw, 76px)' }}>
          <span className="text-[#F7FAFF]">{firstName}</span>
          <span className="text-gradient">{lastName}</span>
        </h1>
        
        <h2 className="text-[20px] sm:text-[24px] font-semibold text-[#F7FAFF] mt-[14px]">
          {role}
        </h2>
        
        <p className="text-[16px] sm:text-[17px] text-[#A8B8CC] leading-[1.65] max-w-[540px] mt-6 mb-8">
          {description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-2 md:px-0 mt-2">
          {profile?.cvUrl ? (
            <a 
              href={profile.cvUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="h-[52px] px-8 rounded-[28px] bg-gradient-to-br from-[#7DB3FF] to-[#5B8CFF] text-[#020914] font-semibold flex items-center justify-center shadow-[0_10px_35px_rgba(61,124,255,0.25)] active:scale-97 transition-transform hover:opacity-90 hover:-translate-y-[2px]"
            >
              Download CV &rarr;
            </a>
          ) : (
            <button 
              disabled
              className="h-[52px] px-8 rounded-[28px] bg-gray-700 text-gray-400 font-semibold flex items-center justify-center opacity-50 cursor-not-allowed"
            >
              CV Not Available
            </button>
          )}
          <Link 
            to="/contact"
            className="h-[52px] px-8 rounded-[28px] bg-white/[0.025] border border-[rgba(130,180,255,0.38)] text-[#F7FAFF] font-medium flex items-center justify-center active:scale-97 transition-transform hover:bg-white/[0.05] hover:shadow-[0_0_15px_rgba(130,180,255,0.15)]"
          >
            Contact Me
          </Link>
        </div>
      </div>
    </section>
  );
}
