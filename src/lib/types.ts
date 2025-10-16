import { Timestamp } from "firebase/firestore";

export type ClaimStatus = "Verified" | "False" | "Inconclusive" | "Trending";

export type Claim = {
  id: string;
  content: string;
  sourceUrls: string[];
  detectionTimestamp: Timestamp;
  lastUpdatedTimestamp: Timestamp;
  status: ClaimStatus;
  confidenceScore: number;
  language: string;
  upvotes?: number;
  downvotes?: number;
};
