import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Projects", path: "/projects" },
  { label: "Gallery", path: "/gallery" },
  { label: "Certificates", path: "/certificates" },
  { label: "Commission", path: "/commission" },
  { label: "QnA", path: "/qna" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Easter egg admin entry
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  const navigate = useNavigate();

  const handleNameClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current > 500) {
      clickCountRef.current = 1; // Reset if clicks are too slow
    } else {
      clickCountRef.current += 1;
    }
    lastClickTimeRef.current = now;

    if (clickCountRef.current === 5) {
      e.preventDefault();
      clickCountRef.current = 0;
      navigate("/admin");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full z-40 transition-all duration-300 pt-[max(0px,env(safe-area-inset-top))]",
          isScrolled ? "bg-[#020914B8] backdrop-blur-[18px] border-b border-white/5" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 h-[64px] sm:h-[72px] flex items-center justify-between">
          <NavLink 
            to="/" 
            onClick={handleNameClick}
            className="font-bold text-lg tracking-tight text-[#F7FAFF] select-none"
          >
            Bintang Prasetyo
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    "text-sm font-medium transition-colors duration-300",
                    isActive ? "text-white" : "text-text-secondary hover:text-white"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-3">
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-white/[0.035] border border-border-subtle active:scale-95 transition-transform"
              aria-label="Toggle theme"
            >
              <Moon size={18} className="text-text-secondary" />
            </button>
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-[14px] bg-white/[0.035] border border-border-subtle active:scale-95 transition-transform"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Fullscreen Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-[#020914E6] backdrop-blur-[24px]"
          >
            <div className="flex items-center justify-between px-5 h-[64px] sm:h-[72px] border-b border-white/5 pt-[max(0px,env(safe-area-inset-top))]">
              <span className="font-bold text-lg tracking-tight text-[#F7FAFF]">Bintang Prasetyo</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-[14px] bg-white/[0.035] border border-white/10 active:scale-95 transition-transform"
                aria-label="Close menu"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <nav className="flex flex-col px-6 py-8 gap-2 overflow-y-auto pb-20">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "text-[24px] font-medium py-4 transition-colors",
                      isActive 
                        ? "text-brand-light drop-shadow-[0_0_15px_rgba(125,179,255,0.3)]" 
                        : "text-text-secondary active:text-white"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
