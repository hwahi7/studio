import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MisinformationChecker } from "@/components/extension/misinformation-checker";
import { Download } from "lucide-react";

export default function ExtensionPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          LocalTruth Chrome Extension
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Bring the power of LocalTruth's AI verification directly to your browser. Detect potential misinformation in real-time on social media, emails, and news articles.
        </p>
         <Button className="mt-4 w-fit">
            <Download className="mr-2 h-4 w-4" />
            Install Chrome Extension
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Extension Simulator</CardTitle>
          <CardDescription>
            Test the detection engine. Paste any text below and our Scout Agent will analyze it for potential misinformation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MisinformationChecker />
        </CardContent>
      </Card>
    </div>
  );
}
