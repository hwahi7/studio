
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MisinformationChecker } from "@/components/extension/misinformation-checker";
import { Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/language-context";

export default function ExtensionPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          {t('ExtensionPage.title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          {t('ExtensionPage.description')}
        </p>
        <div className="flex items-center gap-4 mt-4">
          <Button asChild disabled>
            <Link href="https://chromewebstore.google.com/" target="_blank">
              <Download className="mr-2 h-4 w-4" />
              {t('ExtensionPage.installButton')}
            </Link>
          </Button>
          <Badge variant="outline">{t('ExtensionPage.comingSoon')}</Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t('ExtensionPage.simulatorTitle')}</CardTitle>
          <CardDescription>
            {t('ExtensionPage.simulatorDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MisinformationChecker />
        </CardContent>
      </Card>
    </div>
  );
}
