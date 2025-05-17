import Link from "next/link";
import { TbArrowBigLeftFilled } from "react-icons/tb";
import { TbArrowBigRightFilled } from "react-icons/tb";

interface MovementBtnProps {
  slug: string;
  title: string;
  type: "prev" | "next";
}

export default function MovementBtn({ slug, title, type }: MovementBtnProps) {
  return (
    <Link
      href={`/posts/${encodeURI(slug)}`}
      className={`text-sm text-white dark:text-white bg-point2 px-3 py-2 font-bold rounded-md overflow-ellipsis overflow-hidden hover:bg-point hover:text-point2 whitespace-nowrap max-w-[260px] w-full dark:bg-dark-point2 relative dark:hover:bg-dark-point dark:hover:text-white ${
        type === "prev" ? "pl-8" : "pr-8"
      }`}
    >
      {type === "prev" ? (
        <TbArrowBigLeftFilled className="absolute top-1/2 translate-y-[-50%] left-2" />
      ) : (
        <TbArrowBigRightFilled className="absolute top-1/2 translate-y-[-50%] right-2" />
      )}
      {title}
    </Link>
  );
}
