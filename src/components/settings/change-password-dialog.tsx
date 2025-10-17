
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword } from "@/app/auth-actions";
import { useAuth } from "@/firebase";
import { updatePassword } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
      {t('ChangePasswordDialog.updateButton')}
    </Button>
  );
}

export function ChangePasswordDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(changePassword, initialState);
  const auth = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (state.message === "success" && state.data?.password && auth?.currentUser) {
      updatePassword(auth.currentUser, state.data.password)
        .then(() => {
          toast({
            title: t('ChangePasswordDialog.toast.successTitle'),
            description: t('ChangePasswordDialog.toast.successDescription'),
          });
          setIsOpen(false);
        })
        .catch((error) => {
          toast({
            variant: "destructive",
            title: t('ChangePasswordDialog.toast.failTitle'),
            description: t('ChangePasswordDialog.toast.failDescription'),
          });
        });
    } else if (state.message && state.message !== "success") {
      toast({
        variant: "destructive",
        title: t('ChangePasswordDialog.toast.errorTitle'),
        description: state.message,
      });
    }
  }, [state, auth, toast, t]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ChangePasswordDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('ChangePasswordDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">{t('ChangePasswordDialog.newPassword')}</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{t('ChangePasswordDialog.confirmNewPassword')}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">{t('ChangePasswordDialog.cancelButton')}</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
