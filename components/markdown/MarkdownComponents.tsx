import { extractCodeString } from "@/utils/extractCodeString";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
import type { ComponentPropsWithoutRef } from "react";

type CodeProps = ComponentPropsWithoutRef<"code"> & { inline?: boolean };

export const components = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => <h1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <h2 {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <h3 {...props} />,
  h4: (props: ComponentPropsWithoutRef<"h4">) => <h4 {...props} />,
  hr: (props: ComponentPropsWithoutRef<"hr">) => <hr {...props} />,
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="li-with-hand" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p {...props} />,
  a: (props: ComponentPropsWithoutRef<"a">) => <a {...props} />,
  table: (props: ComponentPropsWithoutRef<"table">) => <table {...props} />,
  th: (props: ComponentPropsWithoutRef<"th">) => <th {...props} />,
  td: (props: ComponentPropsWithoutRef<"td">) => <td {...props} />,

  code({ inline, className, children, ...props }: CodeProps) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = extractCodeString(children);

    if (!inline && match) {
      return <CodeBlock language={match[1]} code={codeString.trim()} />;
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
