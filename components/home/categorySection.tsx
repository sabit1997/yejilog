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
      {categories.map((cat) => (
        <Link
          key={cat}
          href={buildHref(cat)}
          scroll={false}
          className={`cat-chip${selectedCategory === cat ? " active" : ""}`}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}
