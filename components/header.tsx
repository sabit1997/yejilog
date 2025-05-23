import blogConfig from "@/blog.config";
import Link from "next/link";

export default function Header() {
  return (
    <Link
      href="/"
      className="text-4xl font-extrabold py-7 block text-point2 font-partial dark:text-dark-point"
    >
      {blogConfig.title}
    </Link>
  );
}
