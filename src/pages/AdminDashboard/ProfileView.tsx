import React, { useState, useEffect, useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { getProfile, updateProfile, uploadFileToCloudinary } from "../../features/profile/api";
import { SiteProfile } from "../../features/profile/types";

export function ProfileView() {
  const [profile, setProfile] = useState<SiteProfile>({
    name: "",
    firstName: "",
    lastName: "",
    title: "",
    heroDescription: "",
    heroDescriptionAlign: "left",
    projectDescription: "",
    about: "",
    photoUrl: "",
    photoPath: "",
    socialLinks: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile();
        if (data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('social.')) {
      const socialField = field.split('.')[1];
      setProfile(prev => {
        const nextSocial = {
          ...prev.socialLinks,
          [socialField]: value
        };
        if (socialField === 'x') {
          nextSocial.twitter = value;
        } else if (socialField === 'twitter') {
          nextSocial.x = value;
        }
        return {
          ...prev,
          socialLinks: nextSocial
        };
      });
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    type: 'photo1' | 'photo2' | 'cv'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type !== 'cv') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Please select a valid image (JPG, PNG, or WEBP).' });
        return;
      }
    } else {
      if (file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please select a valid PDF file for CV.' });
        return;
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
      return;
    }

    const setUploadState = type === 'photo1' ? setUploading1 : type === 'photo2' ? setUploading2 : setUploadingCV;
    const inputRef = type === 'photo1' ? fileInputRef1 : type === 'photo2' ? fileInputRef2 : cvInputRef;
    
    setUploadState(true);
    setMessage(null);
    
    let cloudinaryUrl = "";
    let cloudinaryPath = "";

    try {
      const { url, path } = await uploadFileToCloudinary(file);
      cloudinaryUrl = url;
      cloudinaryPath = path;
    } catch (err: any) {
      console.error(`[ProfileView] Cloudinary upload failed for ${type}:`, err);
      setMessage({ type: 'error', text: `Upload failed: ${err.message || 'Error uploading to Cloudinary'}` });
      setUploadState(false);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    try {
      let updatePayload: Partial<SiteProfile> = {};
      if (type === 'photo1') {
        updatePayload = { photoUrl: cloudinaryUrl, photoPath: cloudinaryPath };
      } else if (type === 'photo2') {
        updatePayload = { photoUrl2: cloudinaryUrl, photoPath2: cloudinaryPath };
      } else if (type === 'cv') {
        updatePayload = { cvUrl: cloudinaryUrl, cvPath: cloudinaryPath };
      }

      const newProfile = { ...profile, ...updatePayload };
      setProfile(newProfile);
      
      await updateProfile(updatePayload);
      setMessage({ type: 'success', text: `${type === 'cv' ? 'CV' : 'Photo'} updated successfully!` });
    } catch (err: any) {
      console.error("[ProfileView] Firestore save failed:", err);
      setMessage({ type: 'error', text: `Uploaded to Cloudinary but failed to save to Firestore: ${err.code || err.message}` });
    } finally {
      setUploadState(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(profile);
      setMessage({ type: 'success', text: 'Site Content saved successfully!' });
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setMessage({ type: 'error', text: `Failed to save changes: ${err.code || err.message}` });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-text-secondary animate-pulse p-4">Loading profile...</div>;

  return (
    <div className="glass-card p-6 sm:p-8 rounded-2xl max-w-4xl mx-auto">
      <div className="border-b border-white/5 pb-4 mb-6">
        <h2 className="text-2xl font-display font-medium text-white">Site Content Settings</h2>
        <p className="text-sm text-text-secondary mt-1">
          Kelola foto profil, file CV, teks hero & identitas, serta tautan media sosial.
        </p>
      </div>
      
      {message && (
        <div className={`p-4 rounded-lg text-sm mb-6 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-10">
        
        {/* Media Section */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-display border-b border-white/5 pb-2 text-[#7DB3FF]">Media & Files</h3>
          <div className="flex flex-wrap gap-8 items-start">
            {/* Photo 1 */}
            <div className="flex flex-col gap-4 w-full sm:w-48 shrink-0">
              <label className="text-sm text-text-secondary">Profile Photo 1</label>
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile 1" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No Photo</div>
                )}
                {uploading1 && <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">Loading...</div>}
              </div>
              <input type="file" ref={fileInputRef1} accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'photo1')} className="hidden" />
              <button 
                type="button" 
                onClick={() => fileInputRef1.current?.click()} 
                disabled={uploading1} 
                className="ios-glass-btn w-full py-2.5 text-xs text-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{uploading1 ? 'Uploading...' : 'Upload Photo 1'}</span>
              </button>
            </div>

            {/* Photo 2 */}
            <div className="flex flex-col gap-4 w-full sm:w-48 shrink-0">
              <label className="text-sm text-text-secondary">Profile Photo 2</label>
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                {profile.photoUrl2 ? (
                  <img src={profile.photoUrl2} alt="Profile 2" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary text-xs">No Photo 2</div>
                )}
                {uploading2 && <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">Loading...</div>}
              </div>
              <input type="file" ref={fileInputRef2} accept="image/jpeg,image/png,image/webp" onChange={(e) => handleFileUpload(e, 'photo2')} className="hidden" />
              <button 
                type="button" 
                onClick={() => fileInputRef2.current?.click()} 
                disabled={uploading2} 
                className="ios-glass-btn w-full py-2.5 text-xs text-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{uploading2 ? 'Uploading...' : 'Upload Photo 2'}</span>
              </button>
            </div>
            
            {/* CV Upload */}
            <div className="flex flex-col gap-4 w-full sm:w-48 shrink-0">
              <label className="text-sm text-text-secondary">CV / Resume (PDF)</label>
              <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative flex flex-col items-center justify-center p-4 text-center">
                {profile.cvUrl ? (
                  <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-brand-accent text-sm hover:underline">View Current CV</a>
                ) : (
                  <span className="text-text-secondary text-xs">No CV Uploaded</span>
                )}
                {uploadingCV && <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">Loading...</div>}
              </div>
              <input type="file" ref={cvInputRef} accept="application/pdf" onChange={(e) => handleFileUpload(e, 'cv')} className="hidden" />
              <button 
                type="button" 
                onClick={() => cvInputRef.current?.click()} 
                disabled={uploadingCV} 
                className="ios-glass-btn w-full py-2.5 text-xs text-center cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>{uploadingCV ? 'Uploading...' : 'Upload CV PDF'}</span>
              </button>

              {/* CV Access Code Setting */}
              <div className="flex flex-col gap-1.5 mt-1 text-left">
                <label className="text-[11px] text-text-secondary font-medium">Kode Akses Unduh CV (Visitor PIN)</label>
                <input 
                  type="text" 
                  value={profile.cvAccessCode ?? '19112191'} 
                  onChange={e => handleChange('cvAccessCode', e.target.value)} 
                  className="glass-input px-3 py-2 rounded-lg w-full text-xs font-mono text-[#7DB3FF]" 
                  placeholder="19112191" 
                />
                <span className="text-[10px] text-text-muted">Kode akses 8 digit yang wajib dimasukkan pengunjung untuk mengunduh CV.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Hero Section */}
        <div className="flex flex-col gap-6">
          <h3 className="text-lg font-display border-b border-white/5 pb-2 text-[#7DB3FF]">Hero & Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">First Name</label>
              <input type="text" value={profile.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} className="glass-input px-4 py-3 rounded-lg w-full" placeholder="Bintang" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Last Name</label>
              <input type="text" value={profile.lastName || ''} onChange={e => handleChange('lastName', e.target.value)} className="glass-input px-4 py-3 rounded-lg w-full" placeholder="Prasetyo" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-text-secondary">Full Name (Legacy fallback)</label>
              <input type="text" value={profile.name || ''} onChange={e => handleChange('name', e.target.value)} className="glass-input px-4 py-3 rounded-lg w-full" placeholder="Bintang Prasetyo" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm text-text-secondary">Title / Role</label>
              <input type="text" value={profile.title || ''} onChange={e => handleChange('title', e.target.value)} className="glass-input px-4 py-3 rounded-lg w-full" placeholder="Full Stack Developer" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <label className="text-sm text-text-secondary font-medium">Hero Description</label>
                
                {/* Text Alignment Toolbar */}
                <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
                  <span className="text-[11px] text-text-muted px-1.5 hidden sm:inline">Perataan Teks:</span>
                  {[
                    { id: 'left' as const, label: 'Kiri', icon: AlignLeft },
                    { id: 'center' as const, label: 'Tengah', icon: AlignCenter },
                    { id: 'right' as const, label: 'Kanan', icon: AlignRight },
                    { id: 'justify' as const, label: 'Justify', icon: AlignJustify },
                  ].map(({ id, label, icon: Icon }) => {
                    const isActive = (profile.heroDescriptionAlign || 'left') === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleChange('heroDescriptionAlign', id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                            : 'text-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                        }`}
                        title={`Format: Rata ${label}`}
                      >
                        <Icon size={14} />
                        <span className="text-[11px]">{label}</span>
                      </button>
                    );
                  })}
                </div>

                <span className={`text-xs font-mono ${(profile.heroDescription?.length || 0) >= 320 ? 'text-amber-400 font-semibold' : 'text-text-muted'}`}>
                  {(profile.heroDescription?.length || 0)} / 320 karakter
                </span>
              </div>
              <textarea 
                value={profile.heroDescription || ''} 
                maxLength={320}
                onChange={e => {
                  const val = e.target.value.slice(0, 320);
                  handleChange('heroDescription', val);
                }} 
                style={{
                  textAlign: profile.heroDescriptionAlign === 'justify' ? 'justify' : (profile.heroDescriptionAlign || 'left')
                }}
                className={`glass-input px-4 py-3 rounded-lg w-full min-h-[110px] resize-y transition-all ${
                  profile.heroDescriptionAlign === 'right'
                    ? 'text-right'
                    : profile.heroDescriptionAlign === 'justify'
                    ? 'text-justify'
                    : profile.heroDescriptionAlign === 'center'
                    ? 'text-center'
                    : 'text-left'
                }`} 
                placeholder="I'm a passionate developer who loves building web applications..." 
              />
              <div className="flex flex-wrap justify-between items-center gap-2 text-[11px] text-text-muted">
                <span>
                  Format saat ini: <strong className="text-white capitalize">{profile.heroDescriptionAlign === 'justify' ? 'Rata Kiri-Kanan (Justify)' : profile.heroDescriptionAlign === 'right' ? 'Rata Kanan (Right)' : profile.heroDescriptionAlign === 'center' ? 'Rata Tengah (Center)' : 'Rata Kiri (Left)'}</strong>. Dibatasi maks 320 karakter.
                </span>
                {(profile.heroDescription?.length || 0) >= 320 && (
                  <span className="text-amber-400 font-medium shrink-0 ml-2">Batas maksimum 320 karakter tercapai</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-6">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-lg font-display text-[#7DB3FF]">Social Links</h3>
            <p className="text-xs text-text-secondary mt-1">
              Tautan yang dikonfigurasi akan muncul pada dock profil kiri (Instagram, X, Reddit, LinkedIn, GitHub, Email).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/bprasety_' },
              { id: 'x', label: 'X (formerly Twitter)', placeholder: 'https://x.com/bprasety_' },
              { id: 'reddit', label: 'Reddit', placeholder: 'https://reddit.com/user/bprasety_' },
              { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/bintang-prasetyo' },
              { id: 'github', label: 'GitHub', placeholder: 'https://github.com/bprasety' },
              { id: 'email', label: 'Email', placeholder: 'mailto:contact@bintangprasetyo.com' },
            ].map(({ id, label, placeholder }) => (
              <div key={id} className="flex flex-col gap-2">
                <label className="text-sm text-text-secondary">{label}</label>
                <input 
                  type="text" 
                  value={(profile.socialLinks as any)?.[id] ?? (id === 'x' ? (profile.socialLinks as any)?.twitter ?? '' : '')} 
                  onChange={e => handleChange(`social.${id}`, e.target.value)}
                  className="glass-input px-4 py-2.5 rounded-lg w-full"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-white/5">
          <button 
            type="submit" 
            disabled={saving || uploading1 || uploading2 || uploadingCV} 
            className="ios-glass-btn ios-glass-primary px-8 py-3 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{saving ? 'Saving...' : 'Save Site Content'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
