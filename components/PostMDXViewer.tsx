/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image, { ImageLoaderProps } from "next/image";

interface Props {
  source: MDXRemoteSerializeResult;
}

const customLoader = ({ src }: ImageLoaderProps) => {
  return src;
};

const components = {
  h1: (props: any) => <h1 className="text-4xl font-bold mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-3xl font-semibold mb-3" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 pl-4 italic text-gray-600 my-4"
      {...props}
    />
  ),
  table: (props: any) => (
    <table
      className="table-auto border-collapse border border-gray-300 mb-6"
      {...props}
    />
  ),
  th: (props: any) => (
    <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />
  ),
  td: (props: any) => (
    <td className="border border-gray-300 px-4 py-2" {...props} />
  ),
  code({ inline, className, children, ...rest }: any) {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match) {
      return (
        <SyntaxHighlighter
          language={match[1]}
          style={materialDark}
          PreTag="pre"
          wrapLongLines
          wrapLines
          {...rest}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }
    return (
      <code className={`bg-gray-100 px-1 rounded ${className || ""}`} {...rest}>
        {children}
      </code>
    );
  },
  img({ src, alt, width, height, ...rest }: any) {
    const strSrc = String(src);

    return (
      <Image
        loader={customLoader}
        src={strSrc}
        alt={String(alt)}
        width={width ?? 800}
        height={height ?? 600}
        unoptimized
        className="my-6 rounded-lg max-w-full"
        {...rest}
      />
    );
  },
};

export default function PostMDXViewer({ source }: Props) {
  return <MDXRemote {...source} components={components} />;
}
