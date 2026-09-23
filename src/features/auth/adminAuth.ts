import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/config";

/**
 * Verifies whether the authenticated user is an authorized administrator.
 * Security boundary is enforced by Firestore document lookup (`admins/{uid}`)
 * rather than hardcoded email strings in the frontend source code.
 */
export async function verifyIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  try {
    // 1. Primary Authorization: Firestore-backed Admin Role
    const adminDocRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      return true;
    }

    // 2. Fallback for custom claims / token attributes if set
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin === true || tokenResult.claims.role === "admin") {
      return true;
    }

    // 3. Fallback for environment-configured admin email (never hardcoded in code)
    const envAdminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (envAdminEmail && user.email && user.email.toLowerCase() === envAdminEmail.toLowerCase()) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Authorization check failed:", err);
    return false;
  }
}
