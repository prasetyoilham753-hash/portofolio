import { auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

/**
 * Sanitizes Firestore errors to prevent exposing database paths, user IDs,
 * or internal exceptions to the client UI.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const rawMsg = error instanceof Error ? error.message : String(error);

  // Debug logging only in developer console (never rendered in UI)
  if (import.meta.env.DEV) {
    const errInfo: FirestoreErrorInfo = {
      error: rawMsg,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
      },
      operationType,
      path,
    };
    console.warn(`[Firestore Safe Logger] ${operationType} on ${path}:`, errInfo.error);
  }

  // Sanitize message returned to user
  let safeMessage = "Terjadi kendala saat memproses data. Silakan coba beberapa saat lagi.";
  if (rawMsg.includes("Missing or insufficient permissions") || rawMsg.includes("permission-denied")) {
    safeMessage = "Akses ditolak atau sesi Anda tidak memiliki izin untuk tindakan ini.";
  } else if (rawMsg.includes("quota-exceeded") || rawMsg.includes("resource-exhausted")) {
    safeMessage = "Batas permintaan server tercapai. Mohon tunggu sejenak sebelum mencoba lagi.";
  } else if (rawMsg.includes("not-found")) {
    safeMessage = "Data yang diminta tidak ditemukan.";
  } else if (rawMsg.includes("unavailable") || rawMsg.includes("offline")) {
    safeMessage = "Koneksi ke database terputus. Pastikan koneksi internet Anda stabil.";
  }

  throw new Error(safeMessage);
}
