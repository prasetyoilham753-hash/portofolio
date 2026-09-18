import React from "react";
import { Link } from "react-router-dom";
import { SiteProfile } from "../../../features/profile/types";

interface AboutProps {
  profile: SiteProfile | null;
}

export function About({ profile }: AboutProps) {
  const label = profile?.aboutLabel || "About Me";
  const heading = profile?.aboutHeading || "Turning Ideas\nInto Real Products";
  const description = profile?.about || "I'm Bintang Prasetyo, a passionate full stack developer who loves building web applications, exploring new technologies, and creating solutions that make a real impact.";
  const btnText = profile?.aboutButtonText || "Learn More";
  
  const defaultTech = [
    { id: '1', name: "React", order: 1, visible: true },
    { id: '2', name: "Next.js", order: 2, visible: true },
    { id: '3', name: "Firebase", order: 3, visible: true },
    { id: '4', name: "Tailwind CSS", order: 4, visible: true },
    { id: '5', name: "Node.js", order: 5, visible: true },
  ];

  const technologies = profile?.technologies?.length 
    ? profile.technologies.filter(t => t.visible).sort((a, b) => a.order - b.order) 
    : defaultTech;

  return (
    <section className="px-5 py-[64px] md:py-[100px] max-w-[430px] mx-auto md:max-w-7xl reveal">
      
      <div className="bg-[rgba(10,24,42,0.5)] border border-[rgba(130,180,255,0.15)] rounded-[32px] md:rounded-[40px] p-8 md:p-14 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        
        {/* Subtle accent glow inside the card */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[rgba(91,140,255,0.06)] rounded-full blur-[80px] pointer-events-none transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[rgba(139,124,255,0.04)] rounded-full blur-[80px] pointer-events-none transition-opacity"></div>

        <div className="flex flex-col md:flex-row md:gap-16 relative z-10">
          
          {/* Left Column - About Text */}
          <div className="flex flex-col md:flex-1 justify-center">
            <h2 className="text-[15px] font-medium tracking-wide text-[#7DB3FF] mb-5">{label}</h2>
            
            <h3 className="text-[32px] sm:text-[38px] lg:text-[42px] font-bold leading-[1.1] text-[#F7FAFF] mb-6 tracking-[-0.02em] whitespace-pre-line">
              {heading.replace(/\\n/g, '\n')}
            </h3>
            
            <p className="text-[#A8B8CC] leading-[1.7] mb-10 text-[16px] sm:text-[17px] max-w-[480px]">
              {description}
            </p>
            
            <Link to="/about" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[rgba(130,180,255,0.25)] text-[#F7FAFF] font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors w-fit text-[15px] active:scale-95 shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
              {btnText} 
              <span className="text-lg leading-none ml-1">&rarr;</span>
            </Link>
          </div>

          {/* Right Column - Technologies */}
          <div className="mt-12 md:mt-0 md:flex-1 w-full flex flex-col justify-center items-center md:items-end gap-3">
            {technologies.map((tech, i) => (
              <div 
                key={tech.id}
                className="w-full max-w-[320px] h-[60px] rounded-[16px] bg-[rgba(8,18,34,0.7)] border border-[rgba(130,180,255,0.2)] flex items-center justify-between px-6 reveal shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-[rgba(130,180,255,0.4)] transition-all cursor-default"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className="text-[#F7FAFF] font-medium text-[16px] tracking-wide">{tech.name}</span>
                <span className="text-[#5B8CFF] opacity-60 ml-2">&rarr;</span>
              </div>
            ))}
          </div>

        </div>
      </div>

    </section>
  );
}
