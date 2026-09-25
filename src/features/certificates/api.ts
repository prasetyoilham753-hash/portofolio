import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  getDocs
} from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";
import { CertificateItem } from "./types";

const CERTIFICATES_COLLECTION = "certificates";

/**
 * Subscribe to real-time certificates collection.
 */
export function subscribeToCertificates(
  onUpdate: (items: CertificateItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      orderBy("order", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CertificateItem, "id">)
        }));
        onUpdate(items);
      },
      (error) => {
        console.warn("Certificates onSnapshot query fallback:", error);
        // If index or order fails, fallback to simple collection query
        const fallbackQ = collection(db, CERTIFICATES_COLLECTION);
        return onSnapshot(
          fallbackQ,
          (snap) => {
            const items = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<CertificateItem, "id">)
            })).sort((a, b) => (a.order || 0) - (b.order || 0));
            onUpdate(items);
          },
          (err2) => {
            console.error("Certificates fallback subscription error:", err2);
            if (onError) onError(err2);
            handleFirestoreError(err2, OperationType.LIST, CERTIFICATES_COLLECTION);
          }
        );
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, CERTIFICATES_COLLECTION);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Fetch all certificates once.
 */
export async function getCertificates(): Promise<CertificateItem[]> {
  try {
    const q = query(
      collection(db, CERTIFICATES_COLLECTION),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<CertificateItem, "id">)
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, CERTIFICATES_COLLECTION);
    throw error;
  }
}

/**
 * Create a new certificate (Admin only).
 */
export async function createCertificate(
  payload: Omit<CertificateItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const rawImages = Array.isArray(payload.images) && payload.images.length > 0
      ? payload.images.filter(Boolean)
      : (payload.imageUrl ? [payload.imageUrl] : []);

    const data: Record<string, any> = {
      title: payload.title?.trim() || "",
      issuer: payload.issuer?.trim() || "",
      issueDate: payload.issueDate?.trim() || "",
      expirationDate: payload.expirationDate?.trim() || "",
      credentialId: payload.credentialId?.trim() || "",
      credentialUrl: payload.credentialUrl?.trim() || "",
      imageUrl: rawImages[0] || payload.imageUrl?.trim() || "",
      images: rawImages,
      imagePath: payload.imagePath || "",
      imagePaths: Array.isArray(payload.imagePaths) ? payload.imagePaths : [],
      category: payload.category?.trim() || "General",
      description: payload.description?.trim() || "",
      skills: Array.isArray(payload.skills) ? payload.skills : [],
      order: typeof payload.order === "number" ? payload.order : Date.now(),
      featured: Boolean(payload.featured),
      aspectRatio: typeof payload.aspectRatio === "number" ? payload.aspectRatio : 1.4,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CERTIFICATES_COLLECTION);
    throw error;
  }
}

/**
 * Update an existing certificate (Admin only).
 */
export async function updateCertificate(
  id: string,
  payload: Partial<Omit<CertificateItem, "id" | "createdAt">>
): Promise<void> {
  try {
    const data: Record<string, any> = {
      ...payload,
      updatedAt: serverTimestamp(),
    };
    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.issuer !== undefined) data.issuer = payload.issuer.trim();
    if (payload.issueDate !== undefined) data.issueDate = payload.issueDate.trim();
    if (payload.expirationDate !== undefined) data.expirationDate = payload.expirationDate.trim();
    if (payload.credentialId !== undefined) data.credentialId = payload.credentialId.trim();
    if (payload.credentialUrl !== undefined) data.credentialUrl = payload.credentialUrl.trim();
    if (payload.images !== undefined) {
      data.images = Array.isArray(payload.images) ? payload.images.filter(Boolean) : [];
      if (data.images.length > 0 && !payload.imageUrl) {
        data.imageUrl = data.images[0];
      }
    }
    if (payload.imageUrl !== undefined) data.imageUrl = payload.imageUrl.trim();
    if (payload.imagePaths !== undefined) data.imagePaths = payload.imagePaths;
    if (payload.category !== undefined) data.category = payload.category.trim();
    if (payload.description !== undefined) data.description = payload.description.trim();
    if (payload.skills !== undefined) data.skills = payload.skills;

    await updateDoc(doc(db, CERTIFICATES_COLLECTION, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${CERTIFICATES_COLLECTION}/${id}`);
    throw error;
  }
}

/**
 * Delete a certificate (Admin only).
 */
export async function deleteCertificate(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CERTIFICATES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${CERTIFICATES_COLLECTION}/${id}`);
    throw error;
  }
}
