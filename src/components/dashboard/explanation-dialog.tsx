
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Claim } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

export function ExplanationDialog({
  children,
  claim,
}: {
  children: React.ReactNode;
  claim: Claim;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">
            {t('ExplanationDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('ExplanationDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="border-l-4 border-primary pl-4 text-muted-foreground italic">
            "{claim.content}"
          </p>

          {claim.explanation ? (
            <div className="pt-4">
               <p className="text-sm leading-relaxed">{claim.explanation}</p>
            </div>
          ) : (
             <p className="text-sm text-muted-foreground">{t('ExplanationDialog.notAvailable')}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
