"use client";

import type { Claim } from "@/lib/types";
import { ClaimCard } from "./claim-card";

export function ClaimList({ claims }: { claims: Claim[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {claims.map((claim) => (
        <ClaimCard key={claim.id} claim={claim} />
      ))}
    </div>
  );
}
