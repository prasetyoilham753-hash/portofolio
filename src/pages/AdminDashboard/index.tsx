import React, { useEffect, useState } from "react";
import { auth } from "../../services/firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { QnAView } from "./QnAView";
import { ProfileView } from "./ProfileView";

export default function AdminDashboard() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'qna'>('profile');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin");
      } else if (user.email !== "prasetyoilham753@gmail.com") {
        // Kick them out if somehow they bypassed the login screen check
        await signOut(auth);
        navigate("/admin");
      } else {
        setIsAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (isAuthLoading) return null;

  return (
    <div className="flex flex-col gap-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-display font-medium mb-4">Command Center</h1>
          <p className="text-text-secondary text-lg font-light">
            Administrative dashboard.
          </p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-sm tracking-widest uppercase text-brand-accent hover:opacity-80 transition-opacity cursor-pointer"
        >
          Logout →
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'profile' 
              ? 'bg-brand-accent text-bg-primary' 
              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
          }`}
        >
          Site Content
        </button>
        <button
          onClick={() => setActiveTab('qna')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeTab === 'qna' 
              ? 'bg-brand-accent text-bg-primary' 
              : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
          }`}
        >
          QnA Submissions
        </button>
      </div>

      <div className="min-h-[50vh]">
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'qna' && <QnAView />}
      </div>
    </div>
  );
}
