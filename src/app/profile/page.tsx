
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useAuth, useUser } from "@/firebase";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { updateProfile as updateProfileAction } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

const initialState = {
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {t('ProfilePage.saveButton')}
    </Button>
  );
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  useEffect(() => {
    const showToast = (message: string, isError: boolean = false) => {
        let title;
        let description;

        switch (message) {
            case "success":
                title = t('ProfileUpdate.toast.successTitle');
                description = t('ProfileUpdate.toast.successDescription');
                break;
            case "Display name must be at least 3 characters long.":
                 title = t('ProfileUpdate.toast.errorTitle');
                 description = t('ProfileUpdate.toast.nameTooShort');
                 break;
            default:
                title = t('ProfileUpdate.toast.failTitle');
                description = message;
        }

        toast({
            variant: isError ? "destructive" : "default",
            title,
            description,
        });
    }

    if (state.message === "success" && state.data?.displayName && auth?.currentUser) {
      updateAuthProfile(auth.currentUser, { displayName: state.data.displayName })
        .then(() => {
          showToast("success");
        })
        .catch((error) => {
          showToast(error.message, true);
        });
    } else if (state.message && state.message !== "success") {
      showToast(state.message, true);
    }
  }, [state, auth, toast, t]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('ProfilePage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ProfilePage.subtitle')}
        </p>
      </header>

      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>{t('ProfilePage.accountInfoTitle')}</CardTitle>
            <CardDescription>
              {t('ProfilePage.accountInfoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('ProfilePage.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displayName">{t('ProfilePage.displayNameLabel')}</Label>
              <Input
                id="displayName"
                name="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
