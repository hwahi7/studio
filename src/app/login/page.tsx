"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { login } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { initiateEmailSignIn } from "@/firebase/non-blocking-login";
import { redirect } from "next/navigation";
import { useLanguage } from "@/context/language-context";

const initialState = {
  message: "",
  errors: {
    email: "",
    password: "",
  },
  data: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLanguage();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {t('LoginPage.signInButton')}
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      redirect("/");
    }
  }, [user]);

  useEffect(() => {
    if (state.message === "success" && state.data) {
      initiateEmailSignIn(auth, state.data.email, state.data.password);
    }
  }, [state, auth]);

  if (isUserLoading || user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{t('LoginPage.title')}</CardTitle>
          <CardDescription>
            {t('LoginPage.description')}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('LoginPage.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-destructive">{state.errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('LoginPage.passwordLabel')}</Label>
              <Input id="password" type="password" name="password" required />
              {state.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password}
                </p>
              )}
            </div>
            {state.message !== "success" && state.message !== "Invalid input." && state.message !== "" && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <div className="text-sm text-muted-foreground">
              {t('LoginPage.noAccount')}{" "}
              <Link
                href="/signup"
                className="text-primary hover:underline"
                prefetch={false}
              >
                {t('LoginPage.signUpLink')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
