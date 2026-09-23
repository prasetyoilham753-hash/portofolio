import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase/config";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

interface QnAMessage {
  id: string;
  category: string;
  message: string;
  nickname?: string;
  createdAt: any;
}

export function QnAView() {
  const [messages, setMessages] = useState<QnAMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [messageToDelete, setMessageToDelete] = useState<QnAMessage | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "qna_messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QnAMessage[];
      setMessages(msgs);
      setLoading(false);
      setErrorMsg("");
    }, (error: any) => {
      console.error("Error fetching messages:", error);
      if (error.code === 'permission-denied') {
        setErrorMsg("Permission denied. You must be an authorized admin to view this.");
      } else {
        setErrorMsg("Failed to load messages.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = (msg: QnAMessage) => {
    setMessageToDelete(msg);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;
    setIsDeletingMessage(true);
    try {
      await deleteDoc(doc(db, "qna_messages", messageToDelete.id));
      setMessageToDelete(null);
    } catch (error: any) {
      console.error("Error deleting message:", error);
      alert("Gagal menghapus pesan: " + (error?.message || "Periksa izin akun."));
    } finally {
      setIsDeletingMessage(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-display font-medium text-brand-accent">QnA Submissions</h2>
      
      {errorMsg ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-xl text-center font-medium">
          {errorMsg}
        </div>
      ) : loading ? (
        <div className="text-text-secondary text-sm">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="glass-card p-12 rounded-xl text-center text-text-secondary font-light">
          No messages found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {messages.map(msg => (
            <div key={msg.id} className="glass-card p-6 rounded-xl flex flex-col gap-4 relative group">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs tracking-widest uppercase text-brand-accent">
                    {msg.category}
                  </span>
                  <span className="text-sm font-medium">
                    {msg.nickname || "Anonymous"}
                  </span>
                  {msg.createdAt && (
                    <span className="text-xs text-text-tertiary">
                      {new Date(msg.createdAt.toDate()).toLocaleString()}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => handleDelete(msg)}
                  className="ios-glass-btn px-3.5 py-1 text-xs text-red-400 font-semibold cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                >
                  <span>Delete</span>
                </button>
              </div>
              <div className="text-text-secondary font-light whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(messageToDelete)}
        title="Hapus Pesan QnA"
        itemName={messageToDelete ? `${messageToDelete.nickname || "Anon"}: "${messageToDelete.message.slice(0, 60)}${messageToDelete.message.length > 60 ? "..." : ""}"` : undefined}
        description="Pesan QnA ini akan dihapus secara permanen dari database Firestore."
        isDeleting={isDeletingMessage}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingMessage) setMessageToDelete(null);
        }}
      />
    </div>
  );
}