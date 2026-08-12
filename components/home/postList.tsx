import type { Post } from "@/types/post";
import Link from "next/link";

interface PostListProps {
  displayedPosts: Post[];
  totalCount: number;
}

export default function PostList({ displayedPosts, totalCount }: PostListProps) {
  return (
    <section className="section" id="posts" style={{ paddingTop: 0 }}>
      <div className="section-head">
        <span className="section-index">02 / POSTS</span>
        <span className="section-line" />
        <span className="section-count">총 {totalCount}개</span>
      </div>
      <div className="post-list">
        {displayedPosts.length === 0 ? (
          <div className="post-empty" role="status">
            <span>$ find ./posts</span>
            <p>선택한 조건에 맞는 글이 없습니다.</p>
          </div>
        ) : displayedPosts.map((post) => (
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
            <span className="post-arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
