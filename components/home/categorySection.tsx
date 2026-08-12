import Link from "next/link";

interface CategorySectionProps {
  selectedCategory: string;
  selectedTags: string[];
  categories: string[];
}

export default function CategorySection({
  selectedCategory,
  selectedTags,
  categories,
}: CategorySectionProps) {
  const buildHref = (category: string) => {
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    const query = params.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <div className="cat-row">
      <span className="cat-label">CATEGORY</span>
      <div className="cat-list" aria-label="카테고리 목록">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={buildHref(cat)}
            scroll={false}
            aria-current={selectedCategory === cat ? "page" : undefined}
            className={`cat-chip${selectedCategory === cat ? " active" : ""}`}
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}
