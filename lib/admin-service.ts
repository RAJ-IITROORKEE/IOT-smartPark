// lib/admin-service.ts (Server-side only)
import { adminFirestore } from "./firebaseAdmin";
import { AdminUser } from "./types";
import { Timestamp } from "firebase-admin/firestore";

const ADMIN_USERS_COLLECTION = "admin_users";

export class AdminUserService {
  static async verifyUser(username: string, password: string): Promise<AdminUser | null> {
    try {
      const usersQuery = adminFirestore
        .collection(ADMIN_USERS_COLLECTION)
        .where("username", "==", username);
      
      const snapshot = await usersQuery.get();
      
      if (snapshot.empty) return null;
      
      const userDoc = snapshot.docs[0];
      const userData = userDoc.data() as Omit<AdminUser, 'id'>;
      
      // In production, use proper password hashing (bcrypt)
      // For now, using simple comparison
      if (userData.passwordHash === password) {
        // Update last login
        await adminFirestore
          .collection(ADMIN_USERS_COLLECTION)
          .doc(userDoc.id)
          .update({
            lastLogin: Timestamp.now()
          });
        
        return {
          id: userDoc.id,
          ...userData
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error verifying admin user:", error);
      return null;
    }
  }

  static async createAdminUser(username: string, password: string): Promise<string | null> {
    try {
      const docRef = await adminFirestore
        .collection(ADMIN_USERS_COLLECTION)
        .add({
          username,
          passwordHash: password, // In production, hash this properly
          createdAt: Timestamp.now()
        });
      return docRef.id;
    } catch (error) {
      console.error("Error creating admin user:", error);
      return null;
    }
  }
}