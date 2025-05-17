import blogConfig from "@/blog.config";

interface TagSectionProps {
  selectedTag: string | null;
  allTags: string[];
  setSelectedTag: (value: React.SetStateAction<string | null>) => void;
}

export default function TagSection({
  selectedTag,
  allTags,
  setSelectedTag,
}: TagSectionProps) {
  return (
    <section>
      <div className="flex mb-2">
        <span className="px-2 bg-black text-white font-semibold relative">
          {`${blogConfig.emoji.tag} ${blogConfig.title}`}
          <div className="w-0 h-0 border-12 border-l-black absolute top-0 -right-6 border-t-transparent border-r-transparent border-b-transparent z-20"></div>
        </span>
        <h2 className="font-semibold bg-point2 text-white w-fit pl-4 pr-2 relative">
          TAG
          <div className="w-0 h-0 border-12 border-l-point2 absolute top-0 -right-6 border-t-transparent border-r-transparent border-b-transparent z-10"></div>
        </h2>
        <span
          className={`px-2 bg-point pl-4 font-semibold relative dark:text-[var(--font)] ${
            selectedTag ? "" : "hidden"
          }`}
        >
          {selectedTag}
          <div className="w-0 h-0 border-12 border-l-point absolute top-0 -right-6 border-t-transparent border-r-transparent border-b-transparent z-10"></div>
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto">
        <div className="w-0 h-0 border-12 border-l-point2 border-t-transparent border-r-transparent border-b-transparent z-10"></div>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            className={`pl-3 pr-1 text-sm border-r-8 transition-all duration-200 font-semibold cursor-pointer whitespace-nowrap
                ${
                  selectedTag === tag
                    ? "bg-point2 text-white border-point2"
                    : "bg-transparent border-point2"
                }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </section>
  );
}
