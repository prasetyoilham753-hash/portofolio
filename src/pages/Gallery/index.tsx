export default function Gallery() {
  const placeholders = [1, 2, 3, 4, 5, 6];
  
  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">Gallery</h1>
        <p className="text-text-secondary text-lg font-light leading-relaxed">
          Visual studies, digital art, and experimental compositions.
        </p>
      </header>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {placeholders.map((item) => (
          <div key={item} className="break-inside-avoid glass-card rounded-xl overflow-hidden cursor-pointer group">
            <div 
              className="bg-white/5 w-full relative" 
              style={{ height: `${Math.max(200, Math.floor(Math.random() * 400))}px` }}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 z-10 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white font-medium tracking-wide transition-opacity duration-500">View</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
