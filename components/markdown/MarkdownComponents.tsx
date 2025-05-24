import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import customTheme from "../../utils/custom-theme";
import { extractCodeString } from "@/utils/extractCodeString";
import Image from "next/image";
/* eslint-disable @typescript-eslint/no-explicit-any */

export const components = {
  h1: (props: any) => (
    <h1 className="text-4xl font-bold mb-4 my-6" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-3xl font-extrabold my-5 w-fit" {...props} />
  ),
  h3: (props: any) => <h3 className="text-2xl font-semibold my-3" {...props} />,
  h4: (props: any) => <h4 className="text-xl font-semibold my-2" {...props} />,
  hr: (props: any) => <hr className="text-grey my-6" {...props} />,
  li: (props: any) => <li className="li-with-hand" {...props} />,
  p: (props: any) => (
    <p
      className="text-[var(--font)] leading-8 dark:text-white font-medium"
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className="text-[#3D5300] leading-7 underline hover:text-point2 dark:text-dark-point3 dark:hover:text-point2"
      {...props}
    />
  ),

  table: (props: any) => (
    <table
      className="table-auto border-collapse border border-gray-300 my-4"
      {...props}
    />
  ),
  th: (props: any) => (
    <th
      className="border border-gray-300 px-4 py-2 bg-point dark:bg-dark-point2"
      {...props}
    />
  ),
  td: (props: any) => (
    <td className="border border-gray-300 px-4 py-2" {...props} />
  ),

  code({ inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = extractCodeString(children);

    if (!inline && match) {
      return (
        <div className="overflow-x-auto my-4">
          <SyntaxHighlighter
            language={match[1]}
            style={customTheme}
            wrapLongLines
            PreTag="div"
            customStyle={{
              fontSize: "14px",
              lineHeight: "1.6",
              padding: "1rem",
              borderRadius: "0.5rem",
            }}
            {...props}
          >
            {codeString.trim()}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code
        className={`bg-gray-300 px-1 rounded ${className || ""} dark:text-font`}
        {...props}
      >
        {codeString}
      </code>
    );
  },
  img({ src, alt, width, height, ...rest }: any) {
    return (
      <Image
        src={String(src)}
        alt={alt ?? "image"}
        width={width ?? 600}
        height={height ?? 600}
        loading="lazy"
        className="my-6 rounded-lg max-w-full mx-auto"
        {...rest}
      />
    );
  },
};
