import { ThemeProvider } from "@/components/theme/provider";
import { ConvexAuthProvider } from "./convex-auth-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConvexAuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}
