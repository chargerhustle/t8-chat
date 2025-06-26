import { cn } from "@/lib/utils";
import React from "react";

export const HStack: React.FC<React.ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-row items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const VStack: React.FC<React.ComponentProps<"div">> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
};
