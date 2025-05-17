/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, isValidElement, ReactElement } from "react";

export function extractCodeString(children: ReactNode): string {
  if (typeof children === "string") return children;

  if (Array.isArray(children)) {
    return children.map(extractCodeString).join("");
  }

  if (isValidElement(children)) {
    const element = children as ReactElement<any, any>;
    return extractCodeString(element.props.children);
  }

  return "";
}
