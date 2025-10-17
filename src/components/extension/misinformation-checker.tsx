
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { checkTextForMisinformation, getExplanation } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import type { Claim, ClaimStatus } from "@/lib/types";

const initialState = {
  message: "",
  data: null,
  text: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Check for Misinformation
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

  useEffect(() => {
    if (state.message === 'success' && state.data && state.text && firestore) {
      const claimsCollection = collection(firestore, "claims");
      const result = state.data;
      
      let status: ClaimStatus;
      let confidence = result.confidenceScore;
      const INCONCLUSIVE_THRESHOLD = 0.4; 

      if (result.isMisinformation) {
          if (confidence > INCONCLUSIVE_THRESHOLD) {
            status = "False";
          } else {
            status = "Inconclusive";
          }
      } else {
          // If it's not misinformation, it should be Verified.
          // The confidence score from the model reflects certainty of "not misinformation".
          if (confidence > INCONCLUSIVE_THRESHOLD) {
              status = "Verified";
          } else {
              status = "Inconclusive";
          }
      }
      
      const claimForExplanation: Pick<Claim, 'content' | 'status' | 'confidenceScore' | 'upvotes' | 'downvotes'> = {
        content: state.text,
        status: status,
        confidenceScore: confidence,
        upvotes: 0,
        downvotes: 0,
      };

      // Generate the explanation now, to be stored with the claim.
      getExplanation(claimForExplanation).then(explanation => {
        const newClaim: Omit<Claim, "id"> = {
            content: state.text,
            sourceUrls: ['User Input via Extension'],
            detectionTimestamp: Timestamp.now(),
            lastUpdatedTimestamp: Timestamp.now(),
            status: status,
            confidenceScore: confidence,
            language: "en", 
            upvotes: 0,
            downvotes: 0,
            explanation: explanation, // Store the generated explanation
        };

        addDocumentNonBlocking(claimsCollection, newClaim);
      });
      
      setTextareaValue('');
    }
  }, [state, firestore]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(e.target.value);
  }

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        <Textarea
          name="text"
          placeholder="Paste a news headline, social media post, or any text you want to verify..."
          rows={5}
          value={textareaValue}
          onChange={handleTextChange}
        />
        {state?.message && state.message !== 'success' && (
            <p className="text-sm text-destructive">{state.message}</p>
        )}
        <SubmitButton />
      </form>

      {state?.data && state.message === 'success' && (
        <>
          {state.data.isMisinformation ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Potential Misinformation Detected</AlertTitle>
              <AlertDescription>
                <p className="font-semibold">Confidence: {Math.round(state.data.confidenceScore * 100)}%</p>
                <p>
                  <strong>Reason:</strong> {state.data.reason}
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-600/50 text-green-700 dark:border-green-600 [&>svg]:text-green-700">
               <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>No Misinformation Detected</AlertTitle>
              <AlertDescription>
                 <p className="font-semibold">Confidence: {Math.round(state.data.confidenceScore * 100)}%</p>
                <p>
                  <strong>Reason:</strong> {state.data.reason}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
