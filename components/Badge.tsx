import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
}

export default function Badge({ children }: BadgeProps) {
  return (
    <span className="text-xs bg-point2 py-1 px-2 rounded text-gray-800 font-medium dark:bg-dark-point2 dark:text-white">
      {children}
    </span>
  );
}
