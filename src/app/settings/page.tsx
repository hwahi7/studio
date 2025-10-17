
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
import { useRouter } from "next/navigation";
import { ChangePasswordDialog } from "@/components/settings/change-password-dialog";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const router = useRouter();
    const [selectedLocale, setSelectedLocale] = useState('en');

    useEffect(() => {
        // This effect runs only on the client, so localStorage is safe to use.
        const storedLocale = localStorage.getItem('language');
        if (storedLocale) {
            setSelectedLocale(storedLocale);
        }
    }, []);

    const handleLanguageChange = (newLocale: string) => {
        localStorage.setItem('language', newLocale);
        setSelectedLocale(newLocale);
        // We can optionally force a reload to see changes immediately on other pages
        // This is a simple way to ensure all components re-render with the new language preference.
        window.location.reload(); 
    };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account and application settings.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>
            Customize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select onValueChange={handleLanguageChange} value={selectedLocale}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select language" />
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
              Choose the display language for the application.
            </p>
          </div>

           <div className="grid gap-2">
            <Label>Password</Label>
            <div className="flex items-center gap-4">
                <ChangePasswordDialog>
                    <Button variant="outline">Change Password</Button>
                </ChangePasswordDialog>
            </div>
             <p className="text-sm text-muted-foreground">
              Update your account password.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
