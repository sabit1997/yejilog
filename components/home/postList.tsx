import type { Post } from "@/types/post";
import Link from "next/link";

interface PostListProps {
  displayedPosts: Post[];
  totalCount: number;
  /** 아카이브·카테고리 화면에서 섹션 이름을 바꿔 끼운다. */
  label?: string;
  /** 카테고리 이름처럼 대소문자를 그대로 보여야 할 때 쓴다. */
  labelVerbatim?: boolean;
}

export default function PostList({
  displayedPosts,
  totalCount,
  label = "posts",
  labelVerbatim = false,
}: PostListProps) {
  return (
    <section className="section" id="posts">
      <div className="section-head">
        <span
          className={`section-index${labelVerbatim ? " section-index--verbatim" : ""}`}
        >
          <b>{"//"}</b> {label}
        </span>
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
          </Link>
        ))}
      </div>
    </section>
  );
}
