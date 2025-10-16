export type ClaimStatus = "Verified" | "False" | "Inconclusive" | "Trending";

export type Claim = {
  id: string;
  claim: string;
  source: string;
  timestamp: string;
  status: ClaimStatus;
  confidence: number;
  timeToVerify?: number; // in minutes
  upvotes: number;
  downvotes: number;
  explanation?: Record<string, string>;
  supportingEvidence: string[];
  refutingEvidence: string[];
};
