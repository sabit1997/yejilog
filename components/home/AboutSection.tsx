import blogConfig from "@/blog.config";
import Image from "next/image";

export default function AboutSection() {
  const { profile, social } = blogConfig;

  return (
    <section className="standalone-page about-section" aria-labelledby="about-title">
      <div className="about-grid">
        <div className="about-profile">
          <Image
            className="about-image"
            src={profile.image}
            alt="정예지 프로필 사진"
            width={360}
            height={360}
            priority
          />
          <a href={`https://github.com/${social.github}`} target="_blank" rel="noreferrer">
            github/{social.github}
          </a>
          <span>{profile.email}</span>
        </div>
        <div className="about-content">
          <div>
            <span className="command-label">$ whoami</span>
            <h1 id="about-title">프론트엔드 개발자 <em>정예지</em></h1>
            <p>{blogConfig.introduction} 배운 것을 기록하고, 막혔던 지점을 다시 열어보는 곳입니다.</p>
          </div>
          <div>
            <span className="command-label">$ ls ./stack</span>
            <div className="about-stack-grid">
              {profile.stackGroups.map((group) => (
                <section className="about-stack-group" key={group.title}>
                  <h2>{group.title}</h2>
                  <ul>
                    {group.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
