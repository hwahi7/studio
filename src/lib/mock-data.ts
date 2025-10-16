import type { Claim } from "./types";

export const mockClaims: Claim[] = [
  {
    id: "claim-1",
    claim: "City's tap water is contaminated with a new industrial chemical.",
    source: "Viral Social Media Post",
    timestamp: "2 hours ago",
    status: "False",
    confidence: 95,
    timeToVerify: 12,
    upvotes: 120,
    downvotes: 5,
    supportingEvidence: [],
    refutingEvidence: [
      "Official statement from BMC Water Department confirms water is safe and tested daily.",
      "Independent lab tests from last 24 hours show no signs of industrial contaminants."
    ],
  },
  {
    id: "claim-2",
    claim: "Local metro line will be shut down for the next 48 hours due to a technical snag.",
    source: "WhatsApp Forward",
    timestamp: "45 minutes ago",
    status: "Verified",
    confidence: 99,
    timeToVerify: 5,
    upvotes: 250,
    downvotes: 2,
    supportingEvidence: [
        "Official Twitter handle of Mumbai Metro announced a temporary suspension of services on Line 1.",
        "Live traffic apps show service disruptions and bus diversions around the affected metro stations."
    ],
    refutingEvidence: [],
  },
  {
    id: "claim-3",
    claim: "A new 'superfood' mushroom is being sold in local markets that cures diabetes.",
    source: "Health & Wellness Blog",
    timestamp: "1 day ago",
    status: "Inconclusive",
    confidence: 40,
    timeToVerify: 45,
    upvotes: 30,
    downvotes: 15,
    supportingEvidence: [
        "Anecdotal reports from a small online community claim positive health effects."
    ],
    refutingEvidence: [
        "No scientific studies or peer-reviewed research available to support the claim.",
        "National health organizations have not approved this for medical use."
    ],
  },
  {
    id: "claim-4",
    claim: "Schools in the western suburbs will be closed tomorrow due to a predicted cyclone.",
    source: "Anonymous Message Chain",
    timestamp: "15 minutes ago",
    status: "Trending",
    confidence: 60,
    upvotes: 78,
    downvotes: 10,
    supportingEvidence: ["Weather alert from a private agency mentioned a possibility of severe weather."],
    refutingEvidence: ["The official IMD forecast has not issued a cyclone warning for the city."]
  },
];
