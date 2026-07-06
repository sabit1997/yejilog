import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "lime" | "plain";
}

export default function Badge({ children, variant = "lime" }: BadgeProps) {
  return (
    <span className={`pill${variant === "plain" ? " pill-n" : ""}`}>
      {children}
    </span>
  );
}
