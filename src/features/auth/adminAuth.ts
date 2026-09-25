import { User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase/config";

const BOOTSTRAP_ADMIN_EMAILS = [
  "prasetyoilham753@gmail.com",
  "contact@bintangprasetyo.com"
];

/**
 * Verifies whether the authenticated user is an authorized administrator.
 * Security boundary is enforced by Firestore document lookup (`admins/{uid}`)
 * and bootstrapped admin role.
 */
export async function verifyIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  const userEmail = user.email?.toLowerCase().trim() || "";
  const isBootstrapped = BOOTSTRAP_ADMIN_EMAILS.includes(userEmail);

  // If email is a bootstrapped admin email, grant admin access immediately
  if (isBootstrapped) {
    try {
      const adminDocRef = doc(db, "admins", user.uid);
      await setDoc(adminDocRef, {
        email: userEmail,
        role: "admin",
        createdAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("[AdminAuth] Note: Could not auto-write admin doc (non-fatal):", err);
    }
    return true;
  }

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

    // 3. Fallback for environment-configured admin email
    const envAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase().trim();
    if (envAdminEmail && userEmail === envAdminEmail) {
      return true;
    }

    return false;
  } catch (err) {
    console.error("Authorization check failed:", err);
    return false;
  }
}
