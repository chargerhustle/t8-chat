import { ThemeProvider } from "@/components/theme/provider";
import { ConvexAuthProvider } from "./convex-auth-provider";
import { PreferencesProvider } from "@/hooks/use-user-preferences";

/**
 * Wraps child components with authentication, user preferences, and dark theme providers.
 *
 * Ensures that all nested components have access to authentication context, user preferences, and a forced dark theme.
 *
 * @param children - The React nodes to be rendered within the provider hierarchy
 */
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
