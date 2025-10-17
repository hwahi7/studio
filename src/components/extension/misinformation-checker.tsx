"use client";

import { useActionState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { checkTextForMisinformation } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, Timestamp } from "firebase/firestore";
import type { Claim } from "@/lib/types";

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
  const formRef = useRef<HTMLFormElement>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (state.message === 'success' && state.data && state.text && firestore) {
      const claimsCollection = collection(firestore, "claims");
      const result = state.data;
      
      const newClaim: Omit<Claim, "id"> = {
          content: state.text,
          sourceUrls: ['User Input via Extension'],
          detectionTimestamp: Timestamp.now(),
          lastUpdatedTimestamp: Timestamp.now(),
          status: result.isMisinformation ? "False" : "Verified",
          confidenceScore: result.isMisinformation ? result.confidenceScore : 1 - result.confidenceScore,
          language: "en", // Default language for now
          upvotes: 0,
          downvotes: 0,
      };

      addDocumentNonBlocking(claimsCollection, newClaim);
      
      formRef.current?.reset();
    }
  }, [state, firestore]);

  return (
    <div className="space-y-6">
      <form ref={formRef} action={formAction} className="space-y-4">
        <Textarea
          name="text"
          placeholder="Paste a news headline, social media post, or any text you want to verify..."
          rows={5}
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
                 <p className="font-semibold">Confidence: {Math.round((1 - state.data.confidenceScore) * 100)}%</p>
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
