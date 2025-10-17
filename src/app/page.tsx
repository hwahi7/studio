
"use client";

import { ClaimList } from "@/components/dashboard/claim-list";
import { useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import type { Claim } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { mockClaims } from "@/lib/mock-claims";
import { useLanguage } from "@/context/language-context";


export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [displayClaims, setDisplayClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();

  const claimsQuery = useMemoFirebase(
    () => {
      if (!firestore) return null;
      const claimsCollection = collection(firestore, "claims");
      return query(claimsCollection, orderBy("detectionTimestamp", "desc"));
    },
    [firestore]
  );

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push(`/login`);
    }
  }, [isUserLoading, user, router]);

  useEffect(() => {
    async function fetchClaims() {
      if (!claimsQuery) {
        setIsLoading(false);
        setDisplayClaims(mockClaims);
        return;
      }
      
      try {
        setIsLoading(true);
        const querySnapshot = await getDocs(claimsQuery);
        if (querySnapshot.empty) {
          setDisplayClaims(mockClaims);
        } else {
          const fetchedClaims = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Claim));
          setDisplayClaims(fetchedClaims);
        }
      } catch (error) {
        console.error("Error fetching claims:", error);
        setDisplayClaims(mockClaims); // Fallback to mock claims on error
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchClaims();
    }
  }, [claimsQuery, user]);


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
          {t('DashboardPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('DashboardPage.subtitle')}
        </p>
      </header>
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>
      )}
      {!isLoading && displayClaims && <ClaimList claims={displayClaims} />}
    </div>
  );
}
