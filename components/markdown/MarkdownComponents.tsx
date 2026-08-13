import { extractCodeString } from "@/utils/extractCodeString";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
import { Children, createElement, isValidElement } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { createHeadingSlugger } from "@/utils/headings";
import { getCodeBlockLanguage } from "@/utils/codeBlock";

type CodeProps = ComponentPropsWithoutRef<"code"> & { inline?: boolean };

function getReactNodeText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (!isValidElement(child)) return "";

      const childProps = child.props as { children?: ReactNode; alt?: string };
      return childProps.alt ?? getReactNodeText(childProps.children);
    })
    .join("");
}

export function createMarkdownComponents() {
  const slugger = createHeadingSlugger();
  const heading = (Tag: "h1" | "h2" | "h3") =>
    function Heading(props: ComponentPropsWithoutRef<"h1">) {
      const id = slugger.slug(getReactNodeText(props.children));
      return createElement(Tag, { ...props, id });
    };

  return {
    h1: heading("h1"),
    h2: heading("h2"),
    h3: heading("h3"),
    h4: (props: ComponentPropsWithoutRef<"h4">) => <h4 {...props} />,
    hr: (props: ComponentPropsWithoutRef<"hr">) => <hr {...props} />,
    li: (props: ComponentPropsWithoutRef<"li">) => (
      <li className="li-with-hand" {...props} />
    ),
    blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote {...props} />
    ),
    p: (props: ComponentPropsWithoutRef<"p">) => <p {...props} />,
    pre: ({ children }: ComponentPropsWithoutRef<"pre">) => <>{children}</>,
    a: (props: ComponentPropsWithoutRef<"a">) => <a {...props} />,
    table: (props: ComponentPropsWithoutRef<"table">) => <table {...props} />,
    th: (props: ComponentPropsWithoutRef<"th">) => <th {...props} />,
    td: (props: ComponentPropsWithoutRef<"td">) => <td {...props} />,

    code({ inline, className, children, ...props }: CodeProps) {
      const codeString = extractCodeString(children);
      const language = inline ? null : getCodeBlockLanguage(className, codeString);

      if (language) {
        return <CodeBlock language={language} code={codeString.trimEnd()} />;
      }

      return (
        <code className={className} {...props}>
          {codeString}
        </code>
      );
    },

    img({
      src,
      alt,
      width,
      height,
      ...rest
    }: ComponentPropsWithoutRef<"img">) {
      return (
        <Image
          src={String(src)}
          alt={alt ?? "image"}
          width={Number(width) || 700}
          height={Number(height) || 500}
          loading="lazy"
          className="my-6 rounded-lg max-w-full mx-auto"
          {...rest}
        />
      );
    },
  };
}
