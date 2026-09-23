import React, { useState, useEffect, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { SiteProfile } from "../../features/profile/types";
import { subscribeToProjects } from "../../features/projects/api";
import { ProjectItem } from "../../features/projects/types";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const DEFAULT_DESCRIPTION = "A curated collection of digital products, experimental tools, and scalable applications engineered with precision, performance, and modern web aesthetics.";
  const [projectDescription, setProjectDescription] = useState<string>(DEFAULT_DESCRIPTION);

  // Real-time project description from site_content/profile
  useEffect(() => {
    const docRef = doc(db, "site_content", "profile");
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as SiteProfile;
          if (data.projectDescription && data.projectDescription.trim()) {
            setProjectDescription(data.projectDescription.trim());
          }
        }
      },
      (error) => {
        console.warn("Could not load dynamic project description:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time portfolio projects from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToProjects(
      (items) => {
        setProjects(items);
        setLoading(false);
      },
      (error) => {
        console.error("Could not load projects from Firestore:", error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      threshold: 0.1,
    });

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [projects, selectedCategory]);

  // Derive unique categories from existing projects
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      if (p.badge) set.add(p.badge);
      if (Array.isArray(p.categories)) {
        p.categories.forEach((cat) => {
          if (cat.trim()) set.add(cat.trim());
        });
      }
    });
    return ["All", ...Array.from(set)];
  }, [projects]);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return projects;
    return projects.filter((p) => {
      if (p.badge === selectedCategory) return true;
      if (Array.isArray(p.categories) && p.categories.includes(selectedCategory)) return true;
      return false;
    });
  }, [projects, selectedCategory]);

  return (
    <div className="flex flex-col gap-10 pb-24 pt-4 sm:pt-6 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header Section */}
      <header className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-4 font-display">
          Project
        </h1>
        <p className="text-[#A8B8CC] text-base sm:text-lg font-light leading-relaxed">
          {projectDescription}
        </p>
      </header>

      {/* Category Filter Pills - Only rendered when categories exist */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-[rgba(125,179,255,0.25)] border border-[rgba(140,190,255,0.55)] text-white shadow-[0_0_14px_rgba(120,170,255,0.3)]"
                    : "bg-[rgba(10,24,42,0.4)] border border-[rgba(255,255,255,0.12)] text-[#A8B8CC] hover:text-white hover:border-white/25"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* Featured Projects Grid - Only displayed when projects exist */}
      {!loading && projects.length > 0 && (
        <section 
          id="featured-projects-section" 
          className="w-full"
          aria-label="Projects Collection"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {filteredProjects.map((project, i) => (
              <div
                key={project.id}
                className="w-full rounded-[32px] bg-[rgba(10,24,42,0.45)] border border-[rgba(130,180,255,0.16)] overflow-hidden flex flex-col group active:translate-y-[-2px] transition-all duration-300 md:hover:-translate-y-2 reveal shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:border-[rgba(130,180,255,0.4)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.45),0_0_24px_rgba(120,170,255,0.15)] backdrop-blur-xl"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* 1. Media Preview: Image or Video */}
                <div className="h-[220px] sm:h-[240px] w-full overflow-hidden relative bg-black/40">
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,24,42,1)] via-[rgba(10,24,42,0.3)] to-transparent z-10 pointer-events-none" />
                  
                  {project.mediaType === "video" ? (
                    <video
                      src={project.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                    />
                  ) : (
                    <img
                      src={project.mediaUrl}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                      loading="lazy"
                    />
                  )}
                  
                  {/* 7. Lencana (span) */}
                  {project.badge && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[rgba(8,16,28,0.75)] border border-white/20 text-[#7DB3FF] backdrop-blur-md">
                        {project.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Card Body Container */}
                <div className="p-6 sm:p-7 pt-2 sm:pt-3 flex flex-col flex-1 relative z-20 -mt-8">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    {/* 3. Title Projek (h2) */}
                    <h2 className="text-xl sm:text-2xl font-bold text-[#F7FAFF] group-hover:text-white transition-colors">
                      {project.title}
                    </h2>

                    {/* 6. Hyperlink (a) */}
                    {project.hyperlink && (
                      <a
                        href={project.hyperlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ios-glass-icon w-10 h-10 cursor-pointer shrink-0"
                        aria-label={`Lihat detail ${project.title}`}
                        title="Buka tautan project"
                      >
                        <ArrowUpRight size={18} className="text-[#A8B8CC] group-hover:text-white transition-colors" />
                      </a>
                    )}
                  </div>

                  {/* 4. Deskripsi Project (p) */}
                  <p className="text-[14px] sm:text-[15px] text-[#A8B8CC] leading-[1.6] mb-5 flex-1 font-light whitespace-pre-line">
                    {project.description}
                  </p>

                  {/* 5. Beberapa Kategori (div) */}
                  {Array.isArray(project.categories) && project.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      {project.categories.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white/[0.04] border border-white/10 text-white/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
