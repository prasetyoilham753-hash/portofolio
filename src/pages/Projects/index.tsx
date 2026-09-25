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

  // Only valid, non-empty projects that have been filled by the user
  const validProjects = useMemo(() => {
    return projects.filter((p) => p && p.title && p.title.trim().length > 0);
  }, [projects]);

  // Derive unique categories from existing valid projects
  const categories = useMemo(() => {
    if (validProjects.length === 0) return [];
    const set = new Set<string>();
    validProjects.forEach((p) => {
      if (p.badge) set.add(p.badge);
      if (Array.isArray(p.categories)) {
        p.categories.forEach((cat) => {
          if (cat.trim()) set.add(cat.trim());
        });
      }
    });
    return ["All", ...Array.from(set)];
  }, [validProjects]);

  // Filter projects by active category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === "All") return validProjects;
    return validProjects.filter((p) => {
      if (p.badge === selectedCategory) return true;
      if (Array.isArray(p.categories) && p.categories.includes(selectedCategory)) return true;
      return false;
    });
  }, [validProjects, selectedCategory]);

  const hasProjects = !loading && validProjects.length > 0;

  return (
    <div className="flex flex-col gap-10 pb-28 pt-2 sm:pt-4 w-full max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Header Section */}
      <header className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.12]">
          Project
        </h1>
        <p className="text-[#A8B8CC] text-base sm:text-lg font-light leading-relaxed max-w-2xl">
          {projectDescription}
        </p>
      </header>

      {/* Category Filter Pills - Only rendered when user has filled in projects and there are multiple categories */}
      {hasProjects && categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-transparent border border-[#7DB3FF] text-[#7DB3FF] shadow-[0_0_12px_rgba(125,179,255,0.25)]"
                    : "bg-transparent border border-white/15 text-text-secondary hover:text-white hover:border-white/30"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* Featured Projects Grid - Strictly only rendered when the user has filled in projects */}
      {hasProjects && (
        <section 
          id="featured-projects-section" 
          className="w-full"
          aria-label="Projects Collection"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project, i) => (
              <div
                key={project.id}
                className="group relative w-full rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden border border-[rgba(120,170,255,0.18)] bg-[rgba(6,15,35,0.45)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[rgba(140,190,255,0.45)] transition-all duration-300 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_24px_rgba(120,170,255,0.12)] hover:-translate-y-1.5 reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                {/* 1. Media Preview: Image or Video */}
                {project.mediaUrl && (
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-black/40 overflow-hidden select-none">
                    {project.mediaType === "video" ? (
                      <video
                        src={project.mediaUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      />
                    ) : (
                      <img
                        src={project.mediaUrl}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}

                    {/* Gradient Overlay for visual depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,15,35,0.92)] via-[rgba(6,15,35,0.2)] to-transparent opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

                    {/* Lencana / Badge */}
                    {project.badge && (
                      <div className="absolute top-3.5 left-3.5 z-10 pointer-events-none">
                        <span className="px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-[rgba(6,15,35,0.85)] border border-[#7DB3FF]/40 text-[#7DB3FF] backdrop-blur-md shadow-sm">
                          {project.badge}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Card Body Container */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between gap-4 relative z-10">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start justify-between gap-3">
                      {/* 3. Title Projek (h2) */}
                      <h2 className="text-xl sm:text-2xl font-bold text-[#F7FAFF] group-hover:text-white transition-colors tracking-tight leading-snug">
                        {project.title}
                      </h2>

                      {/* 6. Hyperlink (a) */}
                      {project.hyperlink && (
                        <a
                          href={project.hyperlink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ios-glass-icon w-9 h-9 cursor-pointer shrink-0"
                          aria-label={`Buka detail ${project.title}`}
                          title="Buka tautan project"
                        >
                          <ArrowUpRight size={17} className="text-[#A8B8CC] group-hover:text-white transition-colors" />
                        </a>
                      )}
                    </div>

                    {/* 4. Deskripsi Project (p) */}
                    {project.description && (
                      <p className="text-[13.5px] sm:text-[14.5px] text-[#A8B8CC] leading-relaxed font-light whitespace-pre-line line-clamp-4">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* 5. Footer: Kategori (div) & GitHub URL */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 mt-auto">
                    {Array.isArray(project.categories) && project.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {project.categories.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white/[0.04] border border-white/10 text-white/70"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : <div />}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-mono text-[#7DB3FF]/80 hover:text-[#7DB3FF] transition-colors inline-flex items-center gap-1"
                        title="Buka repository GitHub"
                      >
                        <span>GitHub</span>
                        <ArrowUpRight size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
