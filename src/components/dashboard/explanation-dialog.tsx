
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
import { useLanguage, type Language } from "@/context/language-context";
import { translateText } from "@/app/actions";
import { Loader2 } from "lucide-react";

export function ExplanationDialog({
  children,
  claim,
}: {
  children: React.ReactNode;
  claim: Claim;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [translatedExplanation, setTranslatedExplanation] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const { t, language, availableLanguages } = useLanguage();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && claim.explanation) {
      // Reset on open
      setTranslatedExplanation(null);
      
      const targetLanguage = availableLanguages.find(lang => lang.code === language);

      if (language !== 'en' && targetLanguage) {
        setIsLoading(true);
        translateText({
          text: claim.explanation,
          targetLanguage: targetLanguage.name,
        }).then(result => {
          setTranslatedExplanation(result.translatedText);
          setIsLoading(false);
        }).catch(() => {
          setTranslatedExplanation(claim.explanation || null);
          setIsLoading(false);
        });
      } else {
        setTranslatedExplanation(claim.explanation || null);
      }
    }
  };

  const explanationToDisplay = translatedExplanation || claim.explanation;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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

          <div className="pt-4">
            {isLoading ? (
                <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : explanationToDisplay ? (
              <p className="text-sm leading-relaxed">{explanationToDisplay}</p>
            ) : (
              <p className="text-sm text-muted-foreground">{t('ExplanationDialog.notAvailable')}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
