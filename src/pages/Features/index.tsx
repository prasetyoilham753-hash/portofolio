import React, { useState, useEffect, useMemo } from "react";
import { 
  Sparkles, 
  Search, 
  Copy, 
  Check, 
  Code2, 
  Package, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sliders, 
  Boxes,
  Terminal
} from "lucide-react";
import { FeatureComponent, FeaturesHeaderContent } from "../../features/components_library/types";
import { subscribeToPublishedComponents, subscribeToFeaturesHeader } from "../../features/components_library/api";
import { COMPONENT_TEMPLATES } from "../../features/components_library/templates";
import { DynamicComponentRunner } from "../../components/DynamicComponentRunner/DynamicComponentRunner";

export default function Features() {
  const [components, setComponents] = useState<FeatureComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [headerContent, setHeaderContent] = useState<FeaturesHeaderContent>({
    badge: "Interactive UI & Motion Library",
    title: "Feature Components",
    description: "Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif. Coba langsung di sandbox dan salin kode JSX untuk proyek Anda."
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);

  // Modernize component code to guarantee clean two-way forward & backward interactive motion
  const upgradeComponentCode = (comp: FeatureComponent): FeatureComponent => {
    const isCyberpunk = 
      comp.name.toLowerCase().includes("cyberpunk") || 
      comp.code.includes("Ignite Hyperdrive");
    const hasOldOrBuggyCode = 
      comp.code.includes("setClickCount") || 
      comp.code.includes("pulseGlow") || 
      comp.code.includes("activeGlow") || 
      comp.code.includes("StyledButton") || 
      !comp.code.includes("prev => !prev");

    if (isCyberpunk && hasOldOrBuggyCode) {
      return {
        ...comp,
        code: COMPONENT_TEMPLATES[0].code
      };
    }
    return comp;
  };

  useEffect(() => {
    setLoading(true);
    const unsubComponents = subscribeToPublishedComponents(
      (items) => {
        // Prepare template fallbacks for any items not explicitly in Firestore
        const defaultItems: FeatureComponent[] = COMPONENT_TEMPLATES.map((tmpl, index) => ({
          id: `template-${index}-${tmpl.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: tmpl.name,
          category: tmpl.category,
          description: tmpl.description,
          code: tmpl.code,
          css: tmpl.css || "",
          dependencies: tmpl.dependencies,
          status: "published",
          order: 1000 + index
        }));

        if (items && items.length > 0) {
          const dbNames = new Set(items.map((i) => i.name.toLowerCase().trim()));
          const remainingTemplates = defaultItems.filter(
            (t) => !dbNames.has(t.name.toLowerCase().trim())
          );
          // User posted components appear first at the top, followed by curated templates
          setComponents([...items.map(upgradeComponentCode), ...remainingTemplates]);
        } else {
          setComponents(defaultItems);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load published components:", err);
        const defaultItems: FeatureComponent[] = COMPONENT_TEMPLATES.map((tmpl, index) => ({
          id: `template-${index}-${tmpl.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
          name: tmpl.name,
          category: tmpl.category,
          description: tmpl.description,
          code: tmpl.code,
          css: tmpl.css || "",
          dependencies: tmpl.dependencies,
          status: "published",
          order: index
        }));
        setComponents(defaultItems);
        setLoading(false);
      }
    );

    const unsubHeader = subscribeToFeaturesHeader((data) => {
      if (data) {
        setHeaderContent({
          badge: data.badge || "Interactive UI & Motion Library",
          title: data.title || "Feature Components",
          description: data.description || "Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif. Coba langsung di sandbox dan salin kode JSX untuk proyek Anda."
        });
      }
    });

    return () => {
      unsubComponents();
      unsubHeader();
    };
  }, []);

  // Filter only valid components with name filled (fallback code if missing)
  const validComponents = useMemo(() => {
    return components
      .filter((c) => Boolean(c && c.name && c.name.trim().length > 0))
      .map((c) => ({
        ...c,
        code: c.code && c.code.trim() ? c.code : '// Komponen interaktif'
      }));
  }, [components]);

  // Derive unique categories ONLY from components that actually exist in the dashboard
  const categories = useMemo(() => {
    if (validComponents.length === 0) return [];
    const set = new Set<string>();
    validComponents.forEach((c) => {
      if (c.category && c.category.trim().length > 0) {
        set.add(c.category.trim());
      }
    });
    if (set.size === 0) return [];
    return ["All", ...Array.from(set)];
  }, [validComponents]);

  // Reset category to "All" if current selection no longer exists
  useEffect(() => {
    if (selectedCategory !== "All" && !categories.includes(selectedCategory)) {
      setSelectedCategory("All");
    }
  }, [categories, selectedCategory]);

  // Cinematic scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.05 }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [components, selectedCategory]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpandCode = (id: string) => {
    setExpandedCodeId(prev => (prev === id ? null : id));
  };

  // Filter components by active category and search
  const filteredComponents = useMemo(() => {
    let list = selectedCategory === "All" 
      ? validComponents 
      : validComponents.filter(comp => comp.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(comp =>
        comp.name.toLowerCase().includes(q) ||
        comp.description.toLowerCase().includes(q) ||
        comp.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [validComponents, selectedCategory, searchQuery]);

  const hasComponents = !loading && validComponents.length > 0;

  return (
    <div className="flex flex-col gap-10 pb-28 pt-2 sm:pt-4 w-full max-w-[1600px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
      {/* 1. Header Section */}
      <header className="max-w-3xl flex flex-col gap-4">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-medium text-white tracking-tight leading-[1.12]">
          {headerContent.title || "Feature Components"}
        </h1>
        <p className="text-[#A8B8CC] text-base sm:text-lg font-light max-w-2xl leading-relaxed">
          {headerContent.description || "Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif. Coba langsung di sandbox dan salin kode JSX untuk proyek Anda."}
        </p>
      </header>

      {/* 2. Category Filter Pills - Identical div & button styling, only rendered when filled in dashboard */}
      {hasComponents && categories.length > 1 && (
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
                    ? "bg-transparent border border-[#7DB3FF] text-[#7DB3FF] shadow-[0_0_12px_rgba(125,179,255,0.25)] font-semibold"
                    : "bg-transparent border border-white/15 text-text-secondary hover:text-white hover:border-white/30"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Component Showcase Grid - Strictly only rendered when components have been filled in the dashboard */}
      {hasComponents && (
        <section id="feature-components-section" className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredComponents.map((comp, i) => {
              const isCopied = copiedId === comp.id;
              const isCodeExpanded = expandedCodeId === comp.id;

              return (
                <div 
                  key={comp.id}
                  className="group relative w-full rounded-[24px] sm:rounded-[28px] md:rounded-[32px] overflow-hidden border border-[rgba(120,170,255,0.18)] bg-[rgba(6,15,35,0.45)] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:border-[rgba(140,190,255,0.45)] transition-all duration-300 flex flex-col justify-between hover:shadow-[0_16px_40px_rgba(0,0,0,0.4),0_0_24px_rgba(120,170,255,0.12)] hover:-translate-y-1.5 reveal active"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  {/* Header Information */}
                  <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col justify-between gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide bg-[rgba(6,15,35,0.85)] border border-[#7DB3FF]/40 text-[#7DB3FF] backdrop-blur-md shadow-sm">
                            {comp.category}
                          </span>
                          {comp.dependencies && comp.dependencies.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                              {comp.dependencies.map(dep => (
                                <span key={dep} className="px-2 py-0.5 rounded-md text-[10px] font-mono text-white/50 bg-white/5 border border-white/5">
                                  {dep}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions: Code toggle & Copy Code */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleExpandCode(comp.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7DB3FF]/40 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-xs"
                            title={isCodeExpanded ? "Sembunyikan Kode" : "Lihat Kode"}
                          >
                            <Code2 size={14} className={isCodeExpanded ? "text-[#7DB3FF]" : ""} />
                            {isCodeExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyCode(comp.code, comp.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#7DB3FF]/40 text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs group"
                            title={isCopied ? "Tersalin!" : "Salin Kode Komponen"}
                          >
                            {isCopied ? (
                              <>
                                <Check size={14} className="text-emerald-400" />
                                <span className="text-[11px] font-mono text-emerald-400 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} className="group-hover:text-[#7DB3FF] transition-colors" />
                                <span className="text-[11px] font-mono text-white/50 group-hover:text-white/80 hidden sm:inline">Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <h2 className="text-xl font-bold font-display text-white tracking-tight">
                        {comp.name}
                      </h2>
                      {comp.description && (
                        <p className="text-xs sm:text-sm text-[#A8B8CC] font-light leading-relaxed">
                          {comp.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expandable Code Viewer */}
                  {isCodeExpanded && (
                    <div className="p-4 bg-[rgba(3,8,20,0.95)] border-b border-white/10 overflow-x-auto max-h-72">
                      <pre className="font-mono text-xs text-[#E0EBF7] leading-relaxed">
                        <code>{comp.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Interactive Live Preview Sandbox */}
                  <div className="p-4 sm:p-6 bg-black/25 relative flex-1 flex flex-col justify-center">
                    <DynamicComponentRunner
                      code={comp.code}
                      css={comp.css}
                      componentName={comp.name}
                      minHeight="min-h-[200px]"
                      showControls={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
