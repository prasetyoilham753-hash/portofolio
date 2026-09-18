export default function Certificates() {
  const placeholders = [1, 2, 3];
  
  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">Certificates</h1>
        <p className="text-text-secondary text-lg font-light leading-relaxed">
          Verified credentials and technical achievements.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        {placeholders.map((item) => (
          <div key={item} className="glass-card p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer">
            <div>
              <h2 className="text-xl font-medium mb-1">Advanced Frontend Architecture</h2>
              <p className="text-text-secondary text-sm">Issued by Tech Institute · 2024</p>
            </div>
            <div className="text-brand-accent text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
              View Credential →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
