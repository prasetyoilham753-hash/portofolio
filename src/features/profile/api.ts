import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../services/firebase/config";
import { SiteProfile } from "./types";

const PROFILE_DOC_ID = "profile";
const COLLECTION_NAME = "site_content";

export async function getProfile(): Promise<SiteProfile | null> {
  const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as SiteProfile;
  }
  return null;
}

export async function updateProfile(data: Partial<SiteProfile>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, PROFILE_DOC_ID);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function uploadFileToCloudinary(file: File): Promise<{ url: string, path: string }> {
  console.log("[Cloudinary Debug] Starting generic upload:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

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
    console.log("[Cloudinary Debug] Upload successful:", data.secure_url);
    
    return { url: data.secure_url, path: data.public_id || data.secure_url };
  } catch (error: any) {
    console.error("[Cloudinary Debug] Upload failed:", error);
    throw error;
  }
}

export async function uploadProfilePhoto(file: File, oldPhotoPath?: string): Promise<{ url: string, path: string }> {
  console.log("[Cloudinary Debug] Starting upload:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    currentUser: auth.currentUser?.email,
  });

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
    console.log("[Cloudinary Debug] Upload successful:", data.secure_url);

    // Return the Cloudinary secure URL. We can store the public_id in photoPath if needed.
    return { url: data.secure_url, path: data.public_id || data.secure_url };
  } catch (error: any) {
    console.error("[Cloudinary Debug] Upload failed:", error);
    throw error;
  }
}
