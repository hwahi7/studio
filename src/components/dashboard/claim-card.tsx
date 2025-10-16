"use client";

import * as React from "react";
import type { Claim, ClaimStatus } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
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

const statusConfig: Record<
  ClaimStatus,
  {
    icon: React.ElementType;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  Verified: {
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    label: "Verified",
  },
  False: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    label: "False",
  },
  Inconclusive: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Inconclusive",
  },
  Trending: {
    icon: TrendingUp,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    label: "Trending",
  },
};

export function ClaimCard({ claim }: { claim: Claim }) {
  const [upvotes, setUpvotes] = React.useState(claim.upvotes);
  const [downvotes, setDownvotes] = React.useState(claim.downvotes);
  const [voted, setVoted] = React.useState<"up" | "down" | null>(null);

  const handleVote = (type: "up" | "down") => {
    if (voted === type) {
      // unvote
      setVoted(null);
      if (type === "up") setUpvotes(v => v - 1);
      else setDownvotes(v => v - 1);
    } else {
      // change vote or new vote
      if (voted === "up") setUpvotes(v => v - 1);
      if (voted === "down") setDownvotes(v => v - 1);
      setVoted(type);
      if (type === "up") setUpvotes(v => v + 1);
      else setDownvotes(v => v + 1);
    }
  };

  const currentStatus = statusConfig[claim.status];
  const StatusIcon = currentStatus.icon;

  return (
    <TooltipProvider>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{claim.source}</span>
            <span>{claim.timestamp}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <CardTitle className="text-lg leading-snug">{claim.claim}</CardTitle>
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
                <span>{currentStatus.label}</span>
              </Badge>
              {claim.timeToVerify && (
                <Badge
                  variant="outline"
                  className="gap-1.5 border-brand-accent/50 bg-brand-accent/10 text-brand-accent"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Verified in {claim.timeToVerify} mins
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Confidence Score</span>
                <span>{claim.confidence}%</span>
              </div>
              <Progress value={claim.confidence} aria-label={`${claim.confidence}% confidence`} />
            </div>
          </div>
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("gap-1.5", voted === "up" && "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800")}
                    onClick={() => handleVote("up")}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {upvotes}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Community agrees</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("gap-1.5", voted === "down" && "bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800")}
                    onClick={() => handleVote("down")}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    {downvotes}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Community disagrees</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <ExplanationDialog claim={claim}>
              <Button>Explain</Button>
            </ExplanationDialog>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
