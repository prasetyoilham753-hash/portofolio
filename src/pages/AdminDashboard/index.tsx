import React, { useEffect, useState } from "react";
import { auth } from "../../services/firebase/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { verifyIsAdmin } from "../../features/auth/adminAuth";
import { 
  FolderGit2, 
  Palette, 
  Award, 
  UserCheck, 
  Sparkles, 
  LayoutDashboard, 
  MessageSquare,
  LogOut,
  Shield,
  Boxes
} from "lucide-react";
import { ProfileView } from "./ProfileView";
import { WhatIDoView } from "./WhatIDoView";
import { CommentsView } from "./CommentsView";
import { ProjectsView } from "./ProjectsView";
import { GalleryView } from "./GalleryView";
import { CertificatesView } from "./CertificatesView";
import { AboutMeView } from "./AboutMeView";
import { FeatureComponentsView } from "./FeatureComponentsView";

type TabId = 
  | 'features'
  | 'projects' 
  | 'gallery' 
  | 'certificates' 
  | 'about-me' 
  | 'what-i-do' 
  | 'profile' 
  | 'comments';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  group?: string;
}

const DASHBOARD_TABS: TabItem[] = [
  { id: 'features', label: 'Feature Components', icon: <Boxes size={16} /> },
  { id: 'projects', label: 'Projects', icon: <FolderGit2 size={16} /> },
  { id: 'gallery', label: 'Art Gallery', icon: <Palette size={16} /> },
  { id: 'certificates', label: 'Certificates', icon: <Award size={16} /> },
  { id: 'about-me', label: 'About Me', icon: <UserCheck size={16} /> },
  { id: 'what-i-do', label: 'What I Do', icon: <Sparkles size={16} /> },
  { id: 'profile', label: 'Site Content', icon: <LayoutDashboard size={16} /> },
  { id: 'comments', label: 'Comments', icon: <MessageSquare size={16} /> },
];

export default function AdminDashboard() {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('projects');
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
    <div className="flex flex-col gap-8 pb-28">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="max-w-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#7DB3FF]">
            <Shield size={14} className="text-[#7DB3FF]" />
            <span>Admin Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-white tracking-tight">
            Dashboard & Content Manager
          </h1>
          <p className="text-text-secondary text-sm sm:text-base font-light">
            Kelola karya, sertifikat, biografi profil, kueri pengunjung, dan konten situs secara langsung.
          </p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="ios-glass-btn px-4 py-2 text-xs font-semibold uppercase tracking-wider cursor-pointer self-start md:self-auto flex items-center gap-2 text-rose-300 hover:text-rose-200 border-rose-500/20 hover:border-rose-500/40"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </header>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 p-1.5 rounded-2xl bg-[rgba(6,15,35,0.4)] border border-white/10 backdrop-blur-md">
        {DASHBOARD_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`ios-glass-btn px-4 py-2.5 text-xs sm:text-sm font-medium cursor-pointer whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive 
                  ? 'ios-glass-primary text-white shadow-lg border-white/30' 
                  : 'text-text-secondary hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <span className={isActive ? "text-white" : "text-[#7DB3FF]"}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab View Content */}
      <div className="min-h-[50vh] mt-2">
        {activeTab === 'features' && <FeatureComponentsView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'gallery' && <GalleryView />}
        {activeTab === 'certificates' && <CertificatesView />}
        {activeTab === 'about-me' && <AboutMeView />}
        {activeTab === 'what-i-do' && <WhatIDoView />}
        {activeTab === 'profile' && <ProfileView />}
        {activeTab === 'comments' && <CommentsView />}
      </div>
    </div>
  );
}
