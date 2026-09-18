import React, { useState } from "react";
import { submitQnAMessage } from "../../features/qna/api";

export default function QnA() {
  const [message, setMessage] = useState("");
  const [nickname, setNickname] = useState("");
  const [category, setCategory] = useState("Question");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const MAX_CHARS = 500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length === 0 || message.length > MAX_CHARS) return;
    
    setStatus("submitting");
    
    try {
      await submitQnAMessage({
        category,
        message: message.trim(),
        nickname: nickname.trim(),
      });
      setStatus("success");
      setMessage("");
      setNickname("");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-display font-medium mb-6">QnA</h1>
        <p className="text-text-secondary text-lg font-light leading-relaxed">
          Leave a thought, question, idea, or something you never got to say. Completely anonymous.
        </p>
      </header>

      <div className="max-w-2xl">
        {status === "success" ? (
          <div className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-display">Message Received</h2>
            <p className="text-text-secondary font-light">Thank you for sharing your thoughts.</p>
            <button 
              onClick={() => setStatus("idle")}
              className="mt-6 text-brand-accent text-sm tracking-widest uppercase hover:opacity-80 transition-opacity"
            >
              Send Another
            </button>
          </div>
        ) : (
          <form className="glass-card p-8 rounded-2xl flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="nickname" className="text-sm text-text-secondary">Nickname (Optional)</label>
                <input 
                  type="text" 
                  id="nickname" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="glass-input px-4 py-3 rounded-lg" 
                  placeholder="Anonymous"
                  maxLength={50}
                  disabled={status === "submitting"}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="category" className="text-sm text-text-secondary">Category</label>
                <select 
                  id="category" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="glass-input px-4 py-3 rounded-lg appearance-none"
                  disabled={status === "submitting"}
                >
                  <option value="Question">Question</option>
                  <option value="Idea">Idea</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 relative">
              <label htmlFor="message" className="text-sm text-text-secondary">Message</label>
              <textarea 
                id="message" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6} 
                className="glass-input px-4 py-3 rounded-lg resize-none" 
                placeholder="What's on your mind?"
                maxLength={MAX_CHARS}
                disabled={status === "submitting"}
                required
              />
              <div className={`absolute bottom-3 right-4 text-xs ${message.length >= MAX_CHARS ? 'text-red-400' : 'text-text-tertiary'}`}>
                {message.length} / {MAX_CHARS}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={status === "submitting" || message.trim().length === 0}
              className="glass-button w-full py-4 rounded-lg font-medium tracking-wide mt-2 relative overflow-hidden"
            >
              {status === "submitting" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Message"
              )}
            </button>
            {status === "error" && (
              <p className="text-red-400 text-sm text-center mt-2">
                An error occurred while sending your message. Please try again.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
