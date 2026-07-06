import HeroTerminal from "./HeroTerminal";
import blogConfig from "@/blog.config";

export default function ProfileSection() {
  return (
    <section className="hero">
      <div className="hero-eyebrow">
        <span className="live-dot" />
        STATUS: {blogConfig.title} 운영 중
      </div>
      <h1 className="hero-h1">
        안녕하세요.
        <br />
        <em>정예지</em> 입니다.
      </h1>
      <p className="hero-sub">{blogConfig.introduction}</p>
      <HeroTerminal />
    </section>
  );
}
