"use client";

import { ClaimList } from "@/components/dashboard/claim-list";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Claim } from "@/lib/types";

export default function DashboardPage() {
  const firestore = useFirestore();
  const claimsQuery = useMemoFirebase(
    () => {
      if (!firestore) return null;
      const claimsCollection = collection(firestore, "claims");
      return query(claimsCollection, orderBy("detectionTimestamp", "desc"));
    },
    [firestore]
  );
  const { data: claims, isLoading } = useCollection<Claim>(claimsQuery);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Claim Detection Dashboard
        </h1>
        <p className="text-muted-foreground">
          Live feed of trending claims detected by Scout Agent.
        </p>
      </header>
      {isLoading && <p>Loading claims...</p>}
      {claims && <ClaimList claims={claims} />}
    </div>
  );
}
