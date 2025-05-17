import { Post } from "@/app/page";
import Link from "next/link";
import Badge from "../Badge";

interface PostListProps {
  displayedPosts: Post[];
}
export default function PostList({ displayedPosts }: PostListProps) {
  return (
    <ul>
      {displayedPosts.map((post) => (
        <li
          key={post.slug}
          className="border-b border-grey py-4 last:border-0 group cursor-pointer hover:bg-point/50 dark:hover:bg-dark-point "
        >
          <Link href={`/posts/${encodeURI(post.slug)}`}>
            <h2 className="text-xl font-semibold mb-3 group-hover:underline">
              {post.title}
            </h2>

            <p className="text-sm text-gray-400 dark:text-gray-200">
              {post.date} · {post.category}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {post.tags.map((tag) => (
                <Badge key={tag}>#{tag}</Badge>
              ))}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
