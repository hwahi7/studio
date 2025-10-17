
"use client";

import * as React from "react";
import type { Claim, ClaimStatus } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ExplanationDialog } from "./explanation-dialog";
import { useFirestore } from "@/firebase";
import { doc, runTransaction, Timestamp } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useLanguage } from "@/context/language-context";

const statusConfig: Record<
  ClaimStatus,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    labelKey: 'Verified' | 'False' | 'Inconclusive';
  }
> = {
  Verified: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    labelKey: "Verified",
  },
  False: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    labelKey: "False",
  },
  Inconclusive: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    labelKey: "Inconclusive",
  },
};

function toDate(timestamp: Timestamp | { seconds: number; nanoseconds: number }): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
}


export function ClaimCard({ claim }: { claim: Claim }) {
  const firestore = useFirestore();
  const { t } = useLanguage();
  const [voted, setVoted] = React.useState<"up" | "down" | null>(null);
  const isMock = claim.id.startsWith('mock-');
  
  const [_, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000); 
    return () => clearInterval(timer);
  }, []);


  const handleVote = async (type: "up" | "down") => {
    if (!firestore || isMock) return;
    const claimRef = doc(firestore, "claims", claim.id);
    
    runTransaction(firestore, async (transaction) => {
      const claimDoc = await transaction.get(claimRef);
      if (!claimDoc.exists()) {
        throw "Document does not exist!";
      }

      let newUpvotes = claimDoc.data().upvotes || 0;
      let newDownvotes = claimDoc.data().downvotes || 0;
      const currentStatus = claimDoc.data().status;

      if (voted === type) { 
        if (type === 'up') newUpvotes--;
        else newDownvotes--;
        setVoted(null);
      } else { 
        if (voted === 'up') newUpvotes--;
        if (voted === 'down') newDownvotes--;
        if (type === 'up') newUpvotes++;
        else newDownvotes++;
        setVoted(type);
      }
      
      const updateData: { upvotes: number; downvotes: number; status?: ClaimStatus } = {
          upvotes: newUpvotes,
          downvotes: newDownvotes,
      };

      if (type === 'up' && newUpvotes >= 100 && currentStatus !== "Verified") {
        updateData.status = "Verified";
      }

      transaction.update(claimRef, updateData);
    }).catch((e) => {
        errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
            path: claimRef.path,
            operation: 'update',
        })
        );
    });
  };
  
  const timeToVerify = claim.lastUpdatedTimestamp && claim.detectionTimestamp
    ? Math.round((toDate(claim.lastUpdatedTimestamp).getTime() - toDate(claim.detectionTimestamp).getTime()) / 60000)
    : undefined;
  
  const detectionTimeAgo = claim.detectionTimestamp ? formatDistanceToNow(toDate(claim.detectionTimestamp), { addSuffix: true }) : '';


  const currentStatus = statusConfig[claim.status];
  const StatusIcon = currentStatus.icon;
  const translatedStatus = t(`ClaimCard.status.${currentStatus.labelKey}`);

  return (
    <TooltipProvider>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{claim.sourceUrls?.[0] || t('ClaimCard.unknownSource')}</span>
            {detectionTimeAgo && <span>{detectionTimeAgo}</span>}
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardTitle className="text-lg leading-snug">{claim.content}</CardTitle>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "flex items-center gap-1.5 border-0 px-2.5 py-1 text-sm font-semibold",
                  currentStatus.bgColor,
                  currentStatus.color
                )}
              >
                <StatusIcon className="h-4 w-4" />
                <span>{translatedStatus}</span>
              </Badge>
              {timeToVerify !== undefined && timeToVerify >= 0 && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
                >
                  <Clock className="h-3.5 w-3.5" />
                  {t('ClaimCard.verifiedIn', { minutes: timeToVerify })}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{t('ClaimCard.confidenceScore')}</span>
                <span>{Math.round(claim.confidenceScore * 100)}%</span>
              </div>
              <Progress value={claim.confidenceScore * 100} aria-label={`${claim.confidenceScore * 100}% confidence`} />
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isMock}
                    className={cn("gap-1.5", voted === "up" && "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800")}
                    onClick={() => handleVote("up")}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {claim.upvotes || 0}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMock ? <p>{t('ClaimCard.cannotVoteOnMock')}</p> : <p>{t('ClaimCard.communityAgreesTooltip')}</p>}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isMock}
                    className={cn("gap-1.5", voted === "down" && "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800")}
                    onClick={() => handleVote("down")}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {claim.downvotes || 0}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                   {isMock ? <p>{t('ClaimCard.cannotVoteOnMock')}</p> : <p>{t('ClaimCard.communityDisagreesTooltip')}</p>}
                </TooltipContent>
              </Tooltip>
            </div>
            <ExplanationDialog claim={claim}>
              <Button>{t('ClaimCard.explainButton')}</Button>
            </ExplanationDialog>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
