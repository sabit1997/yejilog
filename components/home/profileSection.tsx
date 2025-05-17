import blogConfig from "@/blog.config";
import Image from "next/image";

export default function ProfileSection() {
  return (
    <section className="w-full flex gap-18 font-concon">
      <div className="relative w-25 h-25 shrink-0">
        <Image
          src="/profile.jpg"
          fill
          alt="profile"
          className="border-3 border-black object-cover rounded-full"
        />
      </div>
      <div className="w-full relative">
        <div className="w-full bg-white rounded-4xl flex items-center justify-center text-center border-3 border-black relative shadow-lg float py-8 dark:bg-gray-600 whitespace-pre-line">
          {blogConfig.introduction}
        </div>
        <div className="bg-white w-4 h-4 rounded-full absolute top-16 -left-16 border-3 border-black float-sm dark:bg-gray-600" />
        <div className="bg-white w-6 h-6 rounded-full absolute top-10 -left-10 border-3 border-black float-lg dark:bg-gray-600" />
      </div>
    </section>
  );
}
