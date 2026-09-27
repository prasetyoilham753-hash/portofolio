import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { db, auth } from "../../services/firebase/config";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";
import { SiteProfile } from "./types";

const PROFILE_DOC_ID = "profile";
const COLLECTION_NAME = "site_content";

export function subscribeToProfile(
  onUpdate: (profile: SiteProfile | null) => void,
  onError?: (error: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as SiteProfile);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error("subscribeToProfile error:", error);
      if (onError) onError(error);
    }
  );
}

export async function getProfile(): Promise<SiteProfile | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as SiteProfile;
    }
    return null;
  } catch (error) {
    console.error("getProfile error:", error);
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
    throw new Error(`File terlalu besar (maksimal 25 MB). Ukuran file: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Tipe file tidak didukung: ${file.type}. Harap gunakan gambar (JPG, PNG, WebP, GIF, AVIF), PDF, atau video (MP4, WebM).`);
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
    throw new Error(`Foto profil terlalu besar (maksimal 10 MB).`);
  }
  const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
  if (file.type && !allowedPhotoTypes.has(file.type)) {
    throw new Error(`Format foto profil harus berupa JPG, PNG, WebP, atau AVIF.`);
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
