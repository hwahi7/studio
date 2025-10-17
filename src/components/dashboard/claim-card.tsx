
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
  Loader2
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
import { translateText } from "@/app/actions";

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
  const { t, language, availableLanguages } = useLanguage();
  const [voted, setVoted] = React.useState<"up" | "down" | null>(null);
  const isMock = claim.id.startsWith('mock-');
  
  const [translatedContent, setTranslatedContent] = React.useState<string | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);

  const [localUpvotes, setLocalUpvotes] = React.useState(claim.upvotes || 0);
  const [localDownvotes, setLocalDownvotes] = React.useState(claim.downvotes || 0);
  const [localConfidenceScore, setLocalConfidenceScore] = React.useState(claim.confidenceScore);

  const [_, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000); 
    return () => clearInterval(timer);
  }, []);
  
  React.useEffect(() => {
    setLocalUpvotes(claim.upvotes || 0);
    setLocalDownvotes(claim.downvotes || 0);
    setLocalConfidenceScore(claim.confidenceScore);
  }, [claim]);

  React.useEffect(() => {
    const translateContent = async () => {
      const targetLanguage = availableLanguages.find(lang => lang.code === language);
      if (claim.content && language !== claim.language && targetLanguage && language !== 'en') {
        setIsTranslating(true);
        try {
          const result = await translateText({
            text: claim.content,
            targetLanguage: targetLanguage.name,
          });
          setTranslatedContent(result.translatedText);
        } catch (error) {
          console.error("Translation failed:", error);
          setTranslatedContent(claim.content); // Fallback to original content
        } finally {
          setIsTranslating(false);
        }
      } else {
        setTranslatedContent(claim.content);
      }
    };
    translateContent();
  }, [claim.content, claim.language, language, availableLanguages]);


  const handleVote = async (type: "up" | "down") => {
    if (!firestore || isMock) return;
    const claimRef = doc(firestore, "claims", claim.id);
    const VOTE_IMPACT = 0.01;

    try {
      const { newUpvotes, newDownvotes, newConfidenceScore, newVotedState } = await runTransaction(firestore, async (transaction) => {
        const claimDoc = await transaction.get(claimRef);
        if (!claimDoc.exists()) {
            throw "Document does not exist!";
        }

        let currentUpvotes = claimDoc.data().upvotes || 0;
        let currentDownvotes = claimDoc.data().downvotes || 0;
        let currentConfidenceScore = claimDoc.data().confidenceScore || 0.5;
        let newVotedState: "up" | "down" | null = voted;

        if (voted === type) { // User is un-voting
            if (type === 'up') currentUpvotes--; else currentDownvotes--;
            currentConfidenceScore += (type === 'up' ? -VOTE_IMPACT : VOTE_IMPACT);
            newVotedState = null;
        } else { // User is casting a new vote or changing vote
            if (voted === 'up') { currentUpvotes--; currentConfidenceScore -= VOTE_IMPACT; }
            if (voted === 'down') { currentDownvotes--; currentConfidenceScore += VOTE_IMPACT; }

            if (type === 'up') currentUpvotes++; else currentDownvotes++;
            currentConfidenceScore += (type === 'up' ? VOTE_IMPACT : -VOTE_IMPACT);
            newVotedState = type;
        }
        
        const newConfidenceScore = Math.max(0.01, Math.min(0.99, currentConfidenceScore));
        const newUpvotes = currentUpvotes;
        const newDownvotes = currentDownvotes;

        const updateData = {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            confidenceScore: newConfidenceScore,
        };

        transaction.update(claimRef, updateData);

        return { newUpvotes, newDownvotes, newConfidenceScore, newVotedState };
      });

      // Update local state after successful transaction
      setLocalUpvotes(newUpvotes);
      setLocalDownvotes(newDownvotes);
      setLocalConfidenceScore(newConfidenceScore);
      setVoted(newVotedState);

    } catch (e) {
        console.error("Transaction failed: ", e);
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: claimRef.path,
                operation: 'update',
            })
        );
    }
  };

  
  const timeToVerify = claim.lastUpdatedTimestamp && claim.detectionTimestamp
    ? Math.round((toDate(claim.lastUpdatedTimestamp).getTime() - toDate(claim.detectionTimestamp).getTime()) / 60000)
    : undefined;
  
  const detectionTimeAgo = claim.detectionTimestamp ? formatDistanceToNow(toDate(claim.detectionTimestamp), { addSuffix: true }) : '';


  const currentStatus = statusConfig[claim.status];
  const StatusIcon = currentStatus.icon;
  const translatedStatus = t(`ClaimCard.status.${currentStatus.labelKey}`);
  const contentToDisplay = translatedContent || claim.content;

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
          {isTranslating ? (
            <div className="flex items-center justify-center h-10">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <CardTitle className="text-lg leading-snug">{contentToDisplay}</CardTitle>
          )}
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
                <span>{Math.round(localConfidenceScore * 100)}%</span>
              </div>
              <Progress value={localConfidenceScore * 100} aria-label={`${localConfidenceScore * 100}% confidence`} />
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
                    {localUpvotes}
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
                    {localDownvotes}
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
