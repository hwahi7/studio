import { Timestamp } from "firebase/firestore";

export type ClaimStatus = "Verified" | "False" | "Inconclusive";

export type Claim = {
  id: string;
  content: string;
  sourceUrls: string[];
  detectionTimestamp: Timestamp;
  lastUpdatedTimestamp: Timestamp;
  status: ClaimStatus;
  confidenceScore: number;
  language: string;
  explanation?: string;
  upvotes?: number;
  downvotes?: number;
};
