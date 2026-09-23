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
import { ProjectItem } from "./types";

const PROJECTS_COLLECTION = "projects";

/**
 * Subscribe to real-time portfolio projects.
 */
export function subscribeToProjects(
  onUpdate: (projects: ProjectItem[]) => void,
  onError?: (error: any) => void
) {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      orderBy("order", "asc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ProjectItem, "id">)
        }));
        onUpdate(items);
      },
      (error) => {
        console.error("Firestore projects onSnapshot error:", error);
        // If index or order fails, fallback to simple collection query
        const fallbackQ = collection(db, PROJECTS_COLLECTION);
        return onSnapshot(
          fallbackQ,
          (snap) => {
            const items = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<ProjectItem, "id">)
            }));
            onUpdate(items);
          },
          (err2) => {
            if (onError) onError(err2);
            handleFirestoreError(err2, OperationType.LIST, PROJECTS_COLLECTION);
          }
        );
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PROJECTS_COLLECTION);
    return () => {};
  }
}

/**
 * Create a new portfolio project (Admin only).
 */
export async function createProject(
  payload: Omit<ProjectItem, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const data: Record<string, any> = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      mediaUrl: payload.mediaUrl.trim(),
      mediaType: payload.mediaType || "image",
      mediaPath: payload.mediaPath || "",
      badge: payload.badge?.trim() || "Featured",
      categories: Array.isArray(payload.categories) ? payload.categories.map((c) => c.trim()).filter(Boolean) : [],
      hyperlink: payload.hyperlink?.trim() || "",
      githubUrl: payload.githubUrl?.trim() || "",
      order: typeof payload.order === "number" ? payload.order : Date.now(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, PROJECTS_COLLECTION);
    throw error;
  }
}

/**
 * Update an existing portfolio project (Admin only).
 */
export async function updateProject(
  id: string,
  payload: Partial<Omit<ProjectItem, "id" | "createdAt">>
): Promise<void> {
  try {
    const data: Record<string, any> = {
      ...payload,
      updatedAt: serverTimestamp(),
    };
    if (payload.title) data.title = payload.title.trim();
    if (payload.description) data.description = payload.description.trim();
    if (payload.mediaUrl) data.mediaUrl = payload.mediaUrl.trim();
    if (payload.badge !== undefined) data.badge = payload.badge.trim();
    if (payload.hyperlink !== undefined) data.hyperlink = payload.hyperlink.trim();
    if (payload.githubUrl !== undefined) data.githubUrl = payload.githubUrl.trim();

    await updateDoc(doc(db, PROJECTS_COLLECTION, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${PROJECTS_COLLECTION}/${id}`);
    throw error;
  }
}

/**
 * Delete a portfolio project (Admin only).
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PROJECTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PROJECTS_COLLECTION}/${id}`);
    throw error;
  }
}
