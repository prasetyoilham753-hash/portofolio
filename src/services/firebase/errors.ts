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
  let safeMessage = "An issue occurred while processing your request. Please try again shortly.";
  if (rawMsg.includes("Missing or insufficient permissions") || rawMsg.includes("permission-denied")) {
    safeMessage = "Access denied or your current session does not have permission for this action.";
  } else if (rawMsg.includes("quota-exceeded") || rawMsg.includes("resource-exhausted")) {
    safeMessage = "Server request limit reached. Please wait a moment before trying again.";
  } else if (rawMsg.includes("not-found")) {
    safeMessage = "The requested data could not be found.";
  } else if (rawMsg.includes("unavailable") || rawMsg.includes("offline")) {
    safeMessage = "Database connection lost. Please check that your internet connection is stable.";
  }

  throw new Error(safeMessage);
}
