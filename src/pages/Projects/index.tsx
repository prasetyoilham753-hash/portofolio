export default function Projects() {
  const placeholders = [1, 2, 3, 4];
  
  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">Selected Works</h1>
        <p className="text-text-secondary text-lg font-light leading-relaxed">
          A curated collection of digital products, experimental tools, and scalable applications.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {placeholders.map((item) => (
          <div key={item} className="glass-card rounded-2xl overflow-hidden group cursor-pointer">
            <div className="h-64 bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
            </div>
            <div className="p-8">
              <span className="text-xs tracking-widest uppercase text-brand-accent mb-2 block">Web Application</span>
              <h2 className="text-2xl font-display mb-3">Project Title {item}</h2>
              <p className="text-text-secondary font-light">A brief description of the project highlighting the technical and creative achievements.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
