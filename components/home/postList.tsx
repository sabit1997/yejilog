import type { Post } from "@/types/post";
import Link from "next/link";

interface PostListProps {
  displayedPosts: Post[];
  totalCount: number;
}

export default function PostList({ displayedPosts, totalCount }: PostListProps) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="section-head">
        <span className="section-tag">{"// posts"}</span>
        <span className="section-count">총 {totalCount}개</span>
      </div>
      <div className="post-list">
        {displayedPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/posts/${encodeURI(post.slug)}`}
            className="post-row"
          >
            <div className="post-date">
              {post.date.slice(0, 7).replace("-", ".")}
            </div>
            <div>
              <div className="post-title">{post.title}</div>
              <div className="post-foot">
                <div className="pills">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="pill pill-n">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="post-min">· {post.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
