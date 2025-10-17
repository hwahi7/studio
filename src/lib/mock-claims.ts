
import { Timestamp } from "firebase/firestore";
import type { Claim } from "./types";

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export const mockClaims: Claim[] = [
  {
    id: "mock-1",
    content: "Major city announces plan to ban all private cars from downtown area by 2030 to combat pollution.",
    sourceUrls: ["news-outlet.com"],
    detectionTimestamp: Timestamp.fromDate(threeHoursAgo),
    lastUpdatedTimestamp: Timestamp.fromDate(oneHourAgo),
    status: "Verified",
    confidenceScore: 0.95,
    language: "en",
    upvotes: 128,
    downvotes: 5,
  },
  {
    id: "mock-2",
    content: "Viral video claims a new type of 'superfood' berry can cure common colds in under 12 hours.",
    sourceUrls: ["social-media-post.net"],
    detectionTimestamp: Timestamp.fromDate(oneHourAgo),
    lastUpdatedTimestamp: Timestamp.fromDate(oneHourAgo),
    status: "False",
    confidenceScore: 0.88,
    language: "en",
    upvotes: 34,
    downvotes: 152,
  },
  {
    id: "mock-3",
    content: "Unconfirmed reports circulating on messaging apps about a new public holiday being declared next month.",
    sourceUrls: ["messaging-app-forward"],
    detectionTimestamp: Timestamp.fromDate(yesterday),
    lastUpdatedTimestamp: Timestamp.fromDate(yesterday),
    status: "Inconclusive",
    confidenceScore: 0.45,
    language: "en",
    upvotes: 67,
    downvotes: 21,
  },
];
