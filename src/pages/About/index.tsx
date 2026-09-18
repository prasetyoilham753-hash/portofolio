export default function About() {
  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">About</h1>
        <p className="text-text-secondary text-lg font-light leading-relaxed">
          I am a Creative Technologist and Illustrator, bridging the gap between rigorous engineering and refined visual design. My work focuses on building premium digital experiences that feel both human and technical.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-2xl flex flex-col gap-4">
          <h2 className="text-xl font-display font-medium text-brand-accent">Engineering</h2>
          <p className="text-text-secondary font-light leading-relaxed">
            Specializing in modern frontend architectures, responsive motion design, and scalable backend integrations. I treat code as a material for crafting seamless interactions.
          </p>
        </div>
        
        <div className="glass-card p-8 rounded-2xl flex flex-col gap-4">
          <h2 className="text-xl font-display font-medium text-brand-accent">Illustration</h2>
          <p className="text-text-secondary font-light leading-relaxed">
            Bringing abstract concepts to life through deliberate visual studies, digital art, and spatial compositions. Every aesthetic decision serves a functional purpose.
          </p>
        </div>
      </div>
    </div>
  );
}
