import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function FeaturedProjects() {
  const projects = [
    {
      id: "1",
      title: "TaskFlow",
      description: "A collaborative project management tool built with React and Firebase.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "2",
      title: "Weatherly",
      description: "Real-time weather forecasting application using Next.js and open APIs.",
      image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&q=80&w=800",
    }
  ];

  return (
    <section className="px-5 py-[64px] max-w-[430px] mx-auto md:max-w-7xl reveal">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-brand-light uppercase mb-1">Featured Projects</h2>
          <h3 className="text-[28px] font-bold text-text-primary tracking-tight">My Latest Work</h3>
        </div>
        <Link to="/projects" className="text-sm text-brand-light hover:text-white transition-colors active:scale-95 mb-1.5">
          View All &rarr;
        </Link>
      </div>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
        {projects.map((project, i) => (
          <div 
            key={project.id}
            className="w-full rounded-[32px] bg-[rgba(10,24,42,0.4)] border border-[rgba(130,180,255,0.15)] overflow-hidden flex flex-col group active:translate-y-[-3px] transition-transform duration-300 md:hover:-translate-y-2 reveal shadow-[0_15px_40px_rgba(0,0,0,0.3)] hover:border-[rgba(130,180,255,0.3)] backdrop-blur-xl"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="h-[220px] w-full overflow-hidden relative">
              {/* Image Overlay Glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,24,42,1)] to-transparent z-10"></div>
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100"
                loading="lazy"
              />
            </div>
            <div className="p-7 pt-4 flex flex-col flex-1 relative z-20 -mt-8">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[22px] font-bold text-[#F7FAFF]">{project.title}</h4>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#5B8CFF]/20 group-hover:border-[#5B8CFF]/30 transition-all">
                  <ArrowUpRight size={20} className="text-[#A8B8CC] group-hover:text-white" />
                </div>
              </div>
              <p className="text-[15px] text-[#A8B8CC] leading-[1.6]">
                {project.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
