import { extractCodeString } from "@/utils/extractCodeString";
import Image from "next/image";
import CodeBlock from "./CodeBlock";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const components = {
  h1: (props: any) => <h1 {...props} />,
  h2: (props: any) => <h2 {...props} />,
  h3: (props: any) => <h3 {...props} />,
  h4: (props: any) => <h4 {...props} />,
  hr: (props: any) => <hr {...props} />,
  li: (props: any) => <li className="li-with-hand" {...props} />,
  blockquote: (props: any) => <blockquote {...props} />,
  p: (props: any) => <p {...props} />,
  a: (props: any) => <a {...props} />,
  table: (props: any) => <table {...props} />,
  th: (props: any) => <th {...props} />,
  td: (props: any) => <td {...props} />,

  code({ inline, className, children, ...props }: any) {
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

  img({ src, alt, width, height, ...rest }: any) {
    return (
      <Image
        src={String(src)}
        alt={alt ?? "image"}
        width={width ?? 700}
        height={height ?? 500}
        loading="lazy"
        className="my-6 rounded-lg max-w-full mx-auto"
        {...rest}
      />
    );
  },
};
