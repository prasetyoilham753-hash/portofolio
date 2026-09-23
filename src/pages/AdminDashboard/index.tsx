import React, { useEffect, useState } from "react";
import { auth } from "../../services/firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { verifyIsAdmin } from "../../features/auth/adminAuth";
import { QnAView } from "./QnAView";
import { ProfileView } from "./ProfileView";
import { CommentsView } from "./CommentsView";
import { ProjectsView } from "./ProjectsView";
import { GalleryView } from "./GalleryView";

export default function AdminDashboard() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'gallery' | 'comments' | 'profile' | 'qna'>('projects');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin");
        return;
      }

      const isAdmin = await verifyIsAdmin(user);
      if (!isAdmin) {
        // Kick out unauthorized accounts
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
          className="ios-glass-btn px-5 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <span>Logout →</span>
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('projects')}
          className={`ios-glass-btn px-6 py-2.5 text-sm font-medium cursor-pointer ${
            activeTab === 'projects' ? 'ios-glass-primary' : ''
          }`}
        >
          <span>Projects Portfolio</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`ios-glass-btn px-6 py-2.5 text-sm font-medium cursor-pointer ${
            activeTab === 'gallery' ? 'ios-glass-primary' : ''
          }`}
        >
          <span>Art Gallery</span>
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`ios-glass-btn px-6 py-2.5 text-sm font-medium cursor-pointer ${
            activeTab === 'comments' ? 'ios-glass-primary' : ''
          }`}
        >
          <span>Comments & Filter Frasa</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`ios-glass-btn px-6 py-2.5 text-sm font-medium cursor-pointer ${
            activeTab === 'profile' ? 'ios-glass-primary' : ''
          }`}
        >
          <span>Site Content</span>
        </button>
        <button
          onClick={() => setActiveTab('qna')}
          className={`ios-glass-btn px-6 py-2.5 text-sm font-medium cursor-pointer ${
            activeTab === 'qna' ? 'ios-glass-primary' : ''
          }`}
        >
          <span>QnA Submissions</span>
        </button>
      </div>

      <div className="min-h-[50vh]">
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'gallery' && <GalleryView />}
        {activeTab === 'comments' && <CommentsView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'qna' && <QnAView />}
      </div>
    </div>
  );
}
