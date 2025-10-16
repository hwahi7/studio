"use client";

import { useFormState, useFormStatus } from "react-dom";
import { checkTextForMisinformation } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

const initialState = {
  message: "",
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
  const [state, formAction] = useFormState(
    checkTextForMisinformation,
    initialState
  );
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message !== 'success' && state.message !== '') {
      toast({
        title: "Validation Error",
        description: state.message,
        variant: "destructive",
      });
    }
    // Don't reset the form on success to keep the text
    // if (state.message === 'success') {
    //   formRef.current?.reset();
    // }
  }, [state, toast]);

  return (
    <div className="space-y-6">
      <form ref={formRef} action={formAction} className="space-y-4">
        <Textarea
          name="text"
          placeholder="Paste a news headline, social media post, or any text you want to verify..."
          rows={5}
          key={state.message === 'success' ? Date.now() : 'text-area'}
        />
        <SubmitButton />
      </form>

      {state.data && (
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
