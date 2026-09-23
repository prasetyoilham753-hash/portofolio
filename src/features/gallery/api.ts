import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";
import { GalleryItem } from "./types";

const GALLERY_COLLECTION = "gallery";

/**
 * Subscribe to real-time art gallery items.
 */
export function subscribeToGallery(
  onUpdate: (items: GalleryItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const q = query(
      collection(db, GALLERY_COLLECTION),
      orderBy("order", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<GalleryItem, "id">)
        }));
        onUpdate(items);
      },
      (error) => {
        console.error("Gallery subscription error:", error);
        handleFirestoreError(error, OperationType.LIST, GALLERY_COLLECTION);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, GALLERY_COLLECTION);
    if (onError) onError(error);
    return () => {};
  }
}

/**
 * Create a new gallery artwork (Admin only).
 */
export async function createGalleryItem(
  payload: Omit<GalleryItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const data: Record<string, any> = {
      imageUrl: payload.imageUrl.trim(),
      imagePath: payload.imagePath || "",
      title: payload.title?.trim() || "",
      caption: payload.caption?.trim() || "",
      category: payload.category?.trim() || "",
      year: payload.year?.trim() || "",
      width: typeof payload.width === "number" ? payload.width : 0,
      height: typeof payload.height === "number" ? payload.height : 0,
      aspectRatio: typeof payload.aspectRatio === "number" ? payload.aspectRatio : 1,
      order: typeof payload.order === "number" ? payload.order : Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, GALLERY_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, GALLERY_COLLECTION);
    throw error;
  }
}

/**
 * Update an existing gallery artwork (Admin only).
 */
export async function updateGalleryItem(
  id: string,
  payload: Partial<Omit<GalleryItem, "id" | "createdAt">>
): Promise<void> {
  try {
    const data: Record<string, any> = {
      ...payload,
      updatedAt: serverTimestamp(),
    };
    if (payload.imageUrl) data.imageUrl = payload.imageUrl.trim();
    if (payload.title !== undefined) data.title = payload.title.trim();
    if (payload.caption !== undefined) data.caption = payload.caption.trim();
    if (payload.category !== undefined) data.category = payload.category.trim();
    if (payload.year !== undefined) data.year = payload.year.trim();

    await updateDoc(doc(db, GALLERY_COLLECTION, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GALLERY_COLLECTION}/${id}`);
    throw error;
  }
}

/**
 * Delete a gallery artwork (Admin only).
 */
export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GALLERY_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${GALLERY_COLLECTION}/${id}`);
    throw error;
  }
}
