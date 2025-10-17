
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { useLanguage } from "@/context/language-context";
import { languages } from "@/locales/languages";

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLocale: string) => {
    setLanguage(newLocale);
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('SettingsPage.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('SettingsPage.subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('SettingsPage.preferences.title')}</CardTitle>
          <CardDescription>
            {t('SettingsPage.preferences.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="language">{t('SettingsPage.language.label')}</Label>
            <Select onValueChange={handleLanguageChange} value={language}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('SettingsPage.language.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t('SettingsPage.language.description')}
            </p>
          </div>

          <div className="grid gap-2">
            <Label>{t('SettingsPage.password.label')}</Label>
            <div className="flex items-center gap-4">
              <ChangePasswordDialog>
                <Button variant="outline">{t('SettingsPage.password.button')}</Button>
              </ChangePasswordDialog>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('SettingsPage.password.description')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
