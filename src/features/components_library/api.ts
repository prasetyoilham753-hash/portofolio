import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  Unsubscribe 
} from "firebase/firestore";
import { db, auth } from "../../services/firebase/config";
import { FeatureComponent, FeatureComponentInput, FeaturesHeaderContent } from "./types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error("Firestore Error in Feature Components:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_NAME = "features";
const SETTINGS_DOC_ID = "features_header";

/**
 * Subscribe to Features page header content (h1, p, badge)
 */
export function subscribeToFeaturesHeader(
  onData: (content: FeaturesHeaderContent) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const docRef = doc(db, "site_content", SETTINGS_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as FeaturesHeaderContent);
      } else {
        onData({
          badge: "Interactive UI & Motion Library",
          title: "Feature Components",
          description: "Koleksi komponen antarmuka, animasi mikro, dan eksperimen visual interaktif. Coba langsung di sandbox dan salin kode JSX untuk proyek Anda."
        });
      }
    },
    (error) => {
      console.error("[subscribeToFeaturesHeader] error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `site_content/${SETTINGS_DOC_ID}`);
    }
  );
}

/**
 * Save Features page header content (h1, p, badge)
 */
export async function saveFeaturesHeader(content: FeaturesHeaderContent): Promise<void> {
  const docRef = doc(db, "site_content", SETTINGS_DOC_ID);
  try {
    await setDoc(docRef, {
      badge: (content.badge || "Interactive UI & Motion Library").trim(),
      title: (content.title || "Feature Components").trim(),
      description: (content.description || "").trim(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `site_content/${SETTINGS_DOC_ID}`);
    throw error;
  }
}

/**
 * Subscribe to all feature components (for Admin Dashboard)
 */
export function subscribeToAllComponents(
  onData: (components: FeatureComponent[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: FeatureComponent[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FeatureComponent, "id">),
        }))
        .sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
            return a.order - b.order;
          }
          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeB - timeA;
        });
      onData(items);
    },
    (error) => {
      console.error("[subscribeToAllComponents] error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

/**
 * Subscribe to feature components for Public /features page
 * All components in the database immediately appear without manual draft gating
 */
export function subscribeToPublishedComponents(
  onData: (components: FeatureComponent[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: FeatureComponent[] = snapshot.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FeatureComponent, "id">),
        }))
        .sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
            return a.order - b.order;
          }
          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeB - timeA;
        });
      onData(items);
    },
    (error) => {
      console.error("[subscribeToPublishedComponents] error:", error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
    }
  );
}

/**
 * Create a new Feature Component
 */
export async function createFeatureComponent(input: FeatureComponentInput): Promise<string> {
  const customId = `feat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, COLLECTION_NAME, customId);

  const payload = {
    name: input.name.trim(),
    category: input.category || "Other",
    description: (input.description || "").trim(),
    code: input.code.trim(),
    css: (input.css || "").trim(),
    dependencies: input.dependencies || [],
    status: "published",
    tags: input.tags || [],
    order: Number(input.order) || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return customId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${COLLECTION_NAME}/${customId}`);
    throw error;
  }
}

/**
 * Update an existing Feature Component
 */
export async function updateFeatureComponent(
  id: string,
  input: Partial<FeatureComponentInput>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const payload: any = {
    ...input,
    updatedAt: serverTimestamp(),
  };

  if (payload.name) payload.name = payload.name.trim();
  if (payload.code) payload.code = payload.code.trim();
  if (payload.css !== undefined) payload.css = payload.css.trim();
  if (payload.description !== undefined) payload.description = payload.description.trim();

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Delete a Feature Component
 */
export async function deleteFeatureComponent(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    throw error;
  }
}

/**
 * Toggle component publication status
 */
export async function toggleComponentStatus(
  id: string,
  currentStatus: 'published' | 'draft'
): Promise<'published' | 'draft'> {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  await updateFeatureComponent(id, { status: newStatus });
  return newStatus;
}
