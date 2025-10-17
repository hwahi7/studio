
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { checkTextForMisinformation } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import type { Claim, ClaimStatus } from "@/lib/types";
import { useLanguage } from "@/context/language-context";

const initialState = {
  message: "",
  data: null,
  text: "",
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      {t('MisinformationChecker.buttonText')}
    </Button>
  );
}

export function MisinformationChecker() {
  const [state, formAction] = useActionState(
    checkTextForMisinformation,
    initialState
  );
  const firestore = useFirestore();
  const [textareaValue, setTextareaValue] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (state.message === 'success' && state.data && state.text && firestore) {
      const claimsCollection = collection(firestore, "claims");
      const result = state.data;
      
      let status: ClaimStatus;
      let confidence = result.confidenceScore;
      const INCONCLUSIVE_THRESHOLD = 0.5;

      if (result.isMisinformation) {
        if (confidence > INCONCLUSIVE_THRESHOLD) {
          status = "False";
        } else {
          status = "Inconclusive";
        }
      } else {
        const invertedConfidence = 1.0 - confidence;
        if (invertedConfidence > INCONCLUSIVE_THRESHOLD) {
            status = "Verified";
        } else {
            status = "Inconclusive";
        }
        confidence = invertedConfidence;
      }
      
      const newClaim: Omit<Claim, "id"> = {
          content: state.text,
          sourceUrls: ['User Input via Simulator'],
          detectionTimestamp: Timestamp.now(),
          lastUpdatedTimestamp: Timestamp.now(),
          status: status,
          confidenceScore: confidence,
          language: "en", 
          upvotes: 0,
          downvotes: 0,
          explanation: result.reason, 
      };

      addDocumentNonBlocking(claimsCollection, newClaim);
      
      setTextareaValue('');
    }
  }, [state, firestore]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  }
  
  const getErrorMessage = () => {
    if (!state?.message || state.message === 'success') return null;

    if (state.message === 'error_api' && state.error) {
        return state.error;
    }

    if (state.message === 'error_min_chars' && state.error) {
      return state.error;
    }
    
    return t('MisinformationChecker.errorApi');
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <Textarea
          name="text"
          placeholder={t('MisinformationChecker.placeholder')}
          rows={5}
          value={textareaValue}
          onChange={handleTextChange}
        />
        {errorMessage && (
             <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('MisinformationChecker.alert.errorTitle') || 'Analysis Error'}</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
        )}
        <SubmitButton />
      </form>

      {state?.data && state.message === 'success' && (
        <>
          {state.data.isMisinformation ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('MisinformationChecker.alert.potentialMisinformation')}</AlertTitle>
              <AlertDescription>
                <p className="font-semibold">{t('MisinformationChecker.alert.confidence')}: {Math.round(state.data.confidenceScore * 100)}%</p>
                <p>
                  <strong>{t('MisinformationChecker.alert.reason')}:</strong> {state.data.reason}
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-600/50 text-green-700 dark:border-green-600 [&>svg]:text-green-700">
               <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>{t('MisinformationChecker.alert.noMisinformation')}</AlertTitle>
              <AlertDescription>
                 <p className="font-semibold">{t('MisinformationChecker.alert.confidence')}: {Math.round((1-state.data.confidenceScore) * 100)}%</p>
                <p>
                  <strong>{t('MisinformationChecker.alert.reason')}:</strong> {state.data.reason}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
