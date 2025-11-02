import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type AppKycStatus = "not-started" | "pending" | "verified" | "rejected";

export interface KycBankData {
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  verified?: boolean;
  match_status?: string;
}

export interface KycBvnData {
  bvn: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  verified?: boolean;
  match_status?: string;
  phone?: string;
  date_of_birth?: string;
}

export interface KycSubmissionRecord {
  kycId: string;
  userId: string;
  status: AppKycStatus;
  bvnData?: KycBvnData;
  bankData?: KycBankData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  metadata?: Record<string, any>;
}

export interface KycProgressUpdate {
  status?: AppKycStatus;
  bvnData?: KycBvnData;
  bankData?: KycBankData;
  metadata?: Record<string, any>;
  completed?: boolean;
}

const COLLECTION_NAME = "kycSubmissions";

const generateKycId = () => {
  const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KYC-${Date.now()}-${randomSegment}`;
};

/**
 * Create or update a KYC submission record for a user.
 * Returns the persistent KYC identifier so it can be shown to the user or cached locally.
 */
export const saveKycProgress = async (
  userId: string,
  update: KycProgressUpdate
): Promise<string> => {
  const kycDocRef = doc(db, COLLECTION_NAME, userId);
  const existingDoc = await getDoc(kycDocRef);
  const existingData = existingDoc.exists() ? existingDoc.data() : null;

  const kycId =
    existingData?.kycId && typeof existingData.kycId === "string"
      ? existingData.kycId
      : generateKycId();

  const payload: Record<string, any> = {
    userId,
    kycId,
    updatedAt: serverTimestamp(),
  };

  if (!existingDoc.exists()) {
    payload.createdAt = serverTimestamp();
    // Default new submissions to pending unless explicitly supplied
    payload.status = update.status ?? "pending";
  }

  if (update.status) {
    payload.status = update.status;
  }

  if (update.bvnData) {
    payload.bvnData = {
      ...existingData?.bvnData,
      ...update.bvnData,
    };
  }

  if (update.bankData) {
    payload.bankData = {
      ...existingData?.bankData,
      ...update.bankData,
    };
  }

  if (update.metadata) {
    payload.metadata = {
      ...(existingData?.metadata || {}),
      ...update.metadata,
    };
  }

  if (update.completed) {
    payload.completedAt = serverTimestamp();
  }

  await setDoc(kycDocRef, payload, { merge: true });

  return kycId;
};

/**
 * Convenience helper to mark a KYC submission as verified or pending review after completion.
 */
export const finalizeKycStatus = async (
  userId: string,
  status: Extract<AppKycStatus, "pending" | "verified" | "rejected">,
  metadata?: Record<string, any>
) => {
  return saveKycProgress(userId, {
    status,
    completed: status !== "pending",
    metadata,
  });
};
