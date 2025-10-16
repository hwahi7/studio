import { ClaimList } from "@/components/dashboard/claim-list";
import { mockClaims } from "@/lib/mock-data";

export default function DashboardPage() {
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
      <ClaimList claims={mockClaims} />
    </div>
  );
}
