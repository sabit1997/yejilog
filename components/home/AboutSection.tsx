import Image from "next/image";
import blogConfig from "@/blog.config";

export default function AboutSection() {
  const { profile, social } = blogConfig;

  return (
    <section className="section about-section" id="about">
      <div className="section-head">
        <span className="section-index">04 / ABOUT</span>
        <span className="section-line" />
        <span className="section-count">whoami</span>
      </div>
      <div className="about-grid">
        <div className="about-profile">
          <Image
            className="about-image"
            src={profile.image}
            alt="정예지 프로필"
            width={180}
            height={180}
          />
          <a href={`https://github.com/${social.github}`} target="_blank" rel="noreferrer">
            github/{social.github}
          </a>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </div>
        <div className="about-content">
          <div>
            <span className="command-label">$ whoami</span>
            <h2>프론트엔드 개발자 <em>정예지</em></h2>
            <p>{blogConfig.introduction} 배운 것을 기록하고, 막혔던 지점을 다시 열어보는 곳입니다.</p>
          </div>
          <div>
            <span className="command-label">$ ls ./stack</span>
            <div className="about-stack">
              {profile.stack.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
          <div>
            <span className="command-label">$ cat ./timeline</span>
            <div className="timeline">
              {profile.timeline.map((item) => (
                <div className="timeline-row" key={item.year}>
                  <span>{item.year}</span><p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
