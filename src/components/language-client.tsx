"use client";

import { useLanguage } from "@/context/language-context";
import type { TFunction } from "@/context/language-context";

// This is a wrapper component because hooks can't be used in Server Components.
// It allows us to pass the translation function `t` to Server Components.
export function LanguageClient({ children }: { children: (t: TFunction) => React.ReactNode }) {
  const { t } = useLanguage();
  return <>{children(t)}</>;
}
