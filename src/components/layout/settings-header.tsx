"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { SignOutDialog } from "@/components/auth/sign-out-dialog";

export function SettingsHeader() {
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  const handleSignOutClick = () => {
    setIsSignOutDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsSignOutDialogOpen(false);
  };

  const handleConfirmSignOut = () => {
    void signOut();
    setIsSignOutDialogOpen(false);
  };

  return (
    <header className="flex items-center justify-between pb-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 hover:bg-muted/40"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Chat
      </Button>
      <div className="flex flex-row items-center gap-2">
        {/* Theme toggle temporarily commented out */}
        {/* <Button variant="ghost" size="icon" className="size-8 relative">
          <Sun className="absolute inset-0 m-auto size-4 transition-all duration-200 rotate-0 scale-100" />
          <Moon className="absolute inset-0 m-auto size-4 transition-all duration-200 -rotate-90 scale-0" />
          <span className="sr-only">Toggle theme</span>
        </Button> */}
        <Button
          variant="ghost"
          className="hover:bg-muted/40"
          onClick={handleSignOutClick}
        >
          Sign out
        </Button>
      </div>

      <SignOutDialog
        isOpen={isSignOutDialogOpen}
        onClose={handleCloseDialog}
        onConfirmSignOut={handleConfirmSignOut}
      />
    </header>
  );
}
