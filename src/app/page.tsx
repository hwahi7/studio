"use client";

import { ClaimList } from "@/components/dashboard/claim-list";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import type { Claim } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const claimsQuery = useMemoFirebase(
    () => {
      if (!firestore) return null;
      const claimsCollection = collection(firestore, "claims");
      return query(claimsCollection, orderBy("detectionTimestamp", "desc"));
    },
    [firestore]
  );
  const { data: claims, isLoading } = useCollection<Claim>(claimsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
      {isLoading && <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}
      {claims && <ClaimList claims={claims} />}
    </div>
  );
}
