export default function Commission() {
  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">Commission</h1>
        <p className="text-text-secondary text-lg font-light leading-relaxed">
          Open for select projects, collaborations, and technical consultation.
        </p>
      </header>

      <div className="max-w-2xl">
        <form className="glass-card p-8 rounded-2xl flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm text-text-secondary">Name</label>
              <input type="text" id="name" className="glass-input px-4 py-3 rounded-lg" placeholder="Jane Doe" />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm text-text-secondary">Email</label>
              <input type="email" id="email" className="glass-input px-4 py-3 rounded-lg" placeholder="jane@example.com" />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="project" className="text-sm text-text-secondary">Project Type</label>
            <select id="project" defaultValue="" className="glass-input px-4 py-3 rounded-lg appearance-none">
              <option value="" disabled>Select a project type</option>
              <option value="website">Website Development</option>
              <option value="app">Web Application</option>
              <option value="illustration">Illustration / Art</option>
              <option value="consultation">Technical Consultation</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="details" className="text-sm text-text-secondary">Project Details</label>
            <textarea id="details" rows={5} className="glass-input px-4 py-3 rounded-lg resize-none" placeholder="Tell me about your project, timeline, and budget expectations..."></textarea>
          </div>

          <button type="submit" className="glass-button w-full py-4 rounded-lg font-medium tracking-wide mt-4">
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
}
