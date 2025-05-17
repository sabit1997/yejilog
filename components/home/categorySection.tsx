interface CategorySectionProps {
  selectedCategory: string;
  categories: string[];
  setSelectedCategory: (value: React.SetStateAction<string>) => void;
}

export default function CategorySection({
  selectedCategory,
  categories,
  setSelectedCategory,
}: CategorySectionProps) {
  return (
    <section>
      <div className="flex mb-2">
        <span className="px-2 bg-black text-white font-semibold relative">
          👽 YEJILOG
          <div className="w-0 h-0 border-12 border-l-black absolute top-0 -right-6 border-t-transparent border-r-transparent border-b-transparent z-20"></div>
        </span>
        <h2 className="font-semibold bg-point2 text-white w-fit pl-4 pr-2 relative">
          CATEGORY
          <div className="w-0 h-0 border-12 border-l-point2 absolute top-0 -right-6 border-t-transparent border-r-transparent border-b-transparent z-10"></div>
        </h2>
        <span className="px-2 bg-point pl-4 font-semibold relative dark:text-[var(--font)]">
          {selectedCategory}
          <div className="w-0 h-0 border-12 border-l-point absolute top-0 -right-6 border-t-transparent border-r-transparent border-b-transparent z-10"></div>
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto items-center">
        <div className="w-0 h-0 border-12 border-l-point2 border-t-transparent border-r-transparent border-b-transparent z-10"></div>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`pl-3 pr-1 border-r-8 text-sm transition-all duration-200 cursor-pointer font-semibold border-point2 whitespace-nowrap
                ${
                  selectedCategory === cat
                    ? "text-white bg-point2 font-semibold"
                    : "bg-transparent"
                }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
}
