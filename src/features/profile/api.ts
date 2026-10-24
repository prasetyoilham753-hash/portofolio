import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { db, auth } from "../../services/firebase/config";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";
import { SiteProfile } from "./types";

const PROFILE_DOC_ID = "profile";
const COLLECTION_NAME = "site_content";
const PROFILE_CACHE_KEY = "bp_profile_cache";

export const DEFAULT_FALLBACK_PROFILE: SiteProfile = {
  name: "Bintang Prasetyo",
  firstName: "Bintang",
  lastName: "Prasetyo",
  title: "Creative Developer & Illustrator",
  heroDescription: "I'm a passionate developer who loves building web applications, exploring new technologies, and turning ideas into real, useful products.",
  heroDescriptionAlign: "left",
  about: "Creative developer and digital illustrator bridging spatial interactive experiences and rigorous frontend architecture.",
  photoUrl: "",
  photoPath: "",
  socialLinks: {
    instagram: "https://instagram.com/bprasety_",
    x: "https://x.com/bprasety_",
    twitter: "https://x.com/bprasety_",
    reddit: "https://reddit.com/user/bprasety_",
    linkedin: "https://linkedin.com/in/bintang-prasetyo"
  }
};

/**
 * Returns cached profile from localStorage immediately (0ms delay)
 * ensuring instant render on page load without any waiting state.
 */
export function getCachedProfile(): SiteProfile {
  if (typeof window === "undefined") return DEFAULT_FALLBACK_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (raw) {
      return { ...DEFAULT_FALLBACK_PROFILE, ...(JSON.parse(raw) as SiteProfile) };
    }
  } catch {
    // Graceful fallback
  }
  return DEFAULT_FALLBACK_PROFILE;
}

export function subscribeToProfile(
  onUpdate: (profile: SiteProfile | null) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as SiteProfile;
        try {
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
        } catch {
          // Ignore quota errors
        }
        onUpdate(data);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.warn("subscribeToProfile notice (falling back to cache):", error);
      if (onError) onError(error);
    }
  );
}

export async function getProfile(): Promise<SiteProfile | null> {
  const cached = getCachedProfile();
  if (cached) {
    // Fetch in background to re-validate, but return cached immediately
    (async () => {
      try {
        const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fresh = docSnap.data() as SiteProfile;
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(fresh));
        }
      } catch {
        // Non-blocking
      }
    })();
    return cached;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as SiteProfile;
      try {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
      } catch {}
      return data;
    }
    return null;
  } catch (error) {
    console.warn("getProfile notice:", error);
    return null;
  }
}

export async function updateProfile(data: Partial<SiteProfile>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${PROFILE_DOC_ID}`);
    throw error;
  }
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
  'application/pdf',
  'video/mp4',
  'video/webm',
  'video/quicktime'
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB max

export async function uploadFileToCloudinary(file: File): Promise<{ url: string, path: string }> {
  // Validate file size and type
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds the 25 MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Please upload an image (JPG, PNG, WebP, GIF, AVIF), PDF, or video (MP4, WebM).`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'BINTANGPRASETYO');

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/tu1lmhsg/auto/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }

    const data = await response.json();
    return { url: data.secure_url, path: data.public_id || data.secure_url };
  } catch (error: any) {
    console.error("[Cloudinary] Upload failed:", error.message || error);
    throw error;
  }
}

export async function uploadProfilePhoto(file: File, oldPhotoPath?: string): Promise<{ url: string, path: string }> {
  // Validate file size and type (photos only)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`Profile photo exceeds the 10 MB limit.`);
  }
  const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
  if (file.type && !allowedPhotoTypes.has(file.type)) {
    throw new Error(`Profile photo must be in JPG, PNG, WebP, or AVIF format.`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'BINTANGPRASETYO');

  try {
    const response = await fetch('https://api.cloudinary.com/v1_1/tu1lmhsg/image/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || response.statusText);
    }

    const data = await response.json();
    return { url: data.secure_url, path: data.public_id || data.secure_url };
  } catch (error: any) {
    console.error("[Cloudinary] Photo upload failed:", error.message || error);
    throw error;
  }
}
