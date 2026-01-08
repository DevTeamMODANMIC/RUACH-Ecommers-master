import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore"
import { db } from "./firebase"
import { User } from "../types"

// Message type
export type Message = {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Timestamp | null
  read: boolean
}

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "messages"), {
      senderId,
      receiverId,
      content,
      timestamp: serverTimestamp(),
      read: false,
    })

    return docRef.id
  } catch (error) {
    console.error("Error sending message:", error)
    throw new Error("Failed to send message")
  }
}

// Get messages between two users
export const getMessagesBetweenUsers = async (
  userId1: string,
  userId2: string
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, "messages"),
      where("senderId", "in", [userId1, userId2]),
      where("receiverId", "in", [userId1, userId2]),
      orderBy("timestamp", "asc")
    )
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message))
  } catch (error) {
    console.error("Error fetching messages:", error)
    throw new Error("Failed to fetch messages")
  }
}

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const docRef = doc(db, "messages", messageId)
    await updateDoc(docRef, {
      read: true,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error marking message as read:", error)
    throw new Error("Failed to mark message as read")
  }
}

// Get unread message count for a user
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, "messages"),
      where("receiverId", "==", userId),
      where("read", "==", false)
    )
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error("Error fetching unread message count:", error)
    throw new Error("Failed to fetch unread message count")
  }
}