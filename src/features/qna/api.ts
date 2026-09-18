import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { handleFirestoreError, OperationType } from "../../services/firebase/errors";

export interface QnAMessagePayload {
  nickname?: string;
  category: string;
  message: string;
}

export async function submitQnAMessage(payload: QnAMessagePayload) {
  try {
    const data: any = {
      category: payload.category,
      message: payload.message,
      createdAt: serverTimestamp(),
    };
    
    if (payload.nickname && payload.nickname.trim().length > 0) {
      data.nickname = payload.nickname.trim();
    }

    const docRef = await addDoc(collection(db, "qna_messages"), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "qna_messages");
  }
}
