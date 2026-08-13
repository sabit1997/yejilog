import Link from "next/link";

interface MovementBtnProps {
  slug: string;
  title: string;
  type: "prev" | "next";
}

export default function MovementBtn({ slug, title, type }: MovementBtnProps) {
  return (
    <Link
      href={`/posts/${encodeURI(slug)}`}
      className={`post-nav-btn${type === "next" ? " right" : ""}`}
    >
      <span className="post-nav-direction">{type === "prev" ? "← PREV" : "NEXT →"}</span>
      <span>{title}</span>
    </Link>
  );
}
