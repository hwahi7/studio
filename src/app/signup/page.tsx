
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { signup } from "@/app/auth-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useUser, useAuth } from "@/firebase";
import { initiateEmailSignUp } from "@/firebase/non-blocking-login";
import { redirect } from "next/navigation";
import { useLanguage } from "@/context/language-context";
import { languages } from "@/locales/languages";

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
      {t('SignupPage.signUpButton')}
    </Button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(signup, initialState);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { t, setLanguage } = useLanguage();

  useEffect(() => {
    if (user) {
      redirect("/");
    }
  }, [user]);

  useEffect(() => {
    if (state.message === "success" && state.data) {
      initiateEmailSignUp(
        auth,
        state.data.email,
        state.data.password
      );
    }
  }, [state, auth]);
  
  const handleLanguageChange = (langCode: string) => {
      localStorage.setItem('language', langCode);
      setLanguage(langCode);
  };

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
          <CardTitle className="text-2xl">{t('SignupPage.title')}</CardTitle>
          <CardDescription>
            {t('SignupPage.description')}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t('SignupPage.emailLabel')}</Label>
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
              <Label htmlFor="password">{t('SignupPage.passwordLabel')}</Label>
              <Input id="password" type="password" name="password" required />
              {state.errors?.password && (
                <p className="text-sm text-destructive">
                  {state.errors.password}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">{t('SignupPage.languageLabel')}</Label>
              <Select name="language" defaultValue="en" onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('SignupPage.languagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {state.message !== "success" &&
              state.message !== "Invalid input." &&
              state.message !== "" && (
                <p className="text-sm text-destructive">{state.message}</p>
              )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <div className="text-sm text-muted-foreground">
              {t('SignupPage.haveAccount')}{" "}
              <Link
                href="/login"
                className="text-primary hover:underline"
                prefetch={false}
              >
                {t('SignupPage.loginLink')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
