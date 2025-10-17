
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
import { usePathname, useRouter } from "next/navigation";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { useLocale, useTranslations } from "next-intl";

export default function SettingsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('SettingsPage');

    const handleLanguageChange = (newLocale: string) => {
        // The middleware will handle the redirection.
        router.replace(pathname, {locale: newLocale});
    };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground">
          {t('subtitle')}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('preferences.title')}</CardTitle>
          <CardDescription>
            {t('preferences.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="language">{t('language.label')}</Label>
            <Select onValueChange={handleLanguageChange} defaultValue={locale}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('language.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español (Spanish)</SelectItem>
                <SelectItem value="fr">Français (French)</SelectItem>
                <SelectItem value="de">Deutsch (German)</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                <SelectItem value="zh">中文 (Chinese)</SelectItem>
                <SelectItem value="ja">日本語 (Japanese)</SelectItem>
                <SelectItem value="ar">العربية (Arabic)</SelectItem>
                <SelectItem value="pt">Português (Portuguese)</SelectItem>
                <SelectItem value="ru">Русский (Russian)</SelectItem>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="id">Bahasa Indonesia (Indonesian)</SelectItem>
                <SelectItem value="ur">اردو (Urdu)</SelectItem>
                <SelectItem value="sw">Kiswahili (Swahili)</SelectItem>
                <SelectItem value="ko">한국어 (Korean)</SelectItem>
                <SelectItem value="it">Italiano (Italian)</SelectItem>
                <SelectItem value="nl">Nederlands (Dutch)</SelectItem>
                <SelectItem value="tr">Türkçe (Turkish)</SelectItem>
                <SelectItem value="vi">Tiếng Việt (Vietnamese)</SelectItem>
                <SelectItem value="pl">Polski (Polish)</SelectItem>
                <SelectItem value="th">ไทย (Thai)</SelectItem>
                <SelectItem value="uk">Українська (Ukrainian)</SelectItem>
                <SelectItem value="ro">Română (Romanian)</SelectItem>
                <SelectItem value="el">Ελληνικά (Greek)</SelectItem>
              </SelectContent>
            </Select>
             <p className="text-sm text-muted-foreground">
              {t('language.description')}
            </p>
          </div>

           <div className="grid gap-2">
            <Label>{t('password.label')}</Label>
            <div className="flex items-center gap-4">
                <ChangePasswordDialog>
                    <Button variant="outline">{t('password.button')}</Button>
                </ChangePasswordDialog>
            </div>
             <p className="text-sm text-muted-foreground">
              {t('password.description')}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
