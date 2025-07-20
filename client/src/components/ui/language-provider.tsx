import { LanguageProvider as LanguageContextProvider } from "@/hooks/use-language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageContextProvider>
      {children}
    </LanguageContextProvider>
  );
}
