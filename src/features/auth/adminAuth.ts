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

  try {
    const userEmail = user.email?.toLowerCase().trim() || "";
    const isBootstrapped = BOOTSTRAP_ADMIN_EMAILS.includes(userEmail);

    // 1. Primary Authorization: Firestore-backed Admin Role
    const adminDocRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) {
      return true;
    }

    // 2. If bootstrapped admin email, ensure admin document exists in Firestore
    if (isBootstrapped) {
      try {
        await setDoc(adminDocRef, {
          email: userEmail,
          role: "admin",
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("[AdminAuth] Note: Could not auto-write admin doc:", err);
      }
      return true;
    }

    // 3. Fallback for custom claims / token attributes if set
    const tokenResult = await user.getIdTokenResult();
    if (tokenResult.claims.admin === true || tokenResult.claims.role === "admin") {
      return true;
    }

    // 4. Fallback for environment-configured admin email
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
