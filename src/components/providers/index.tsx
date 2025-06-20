import { ThemeProvider } from "@/components/theme/provider";
import { ConvexAuthProvider } from "./convex-auth-provider";
import { PreferencesProvider } from "@/hooks/use-user-preferences";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthProvider>
      <PreferencesProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </PreferencesProvider>
    </ConvexAuthProvider>
  );
}
