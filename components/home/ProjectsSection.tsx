import blogConfig from "@/blog.config";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  pushed_at: string;
  default_branch: string;
  topics: string[];
  language: string | null;
  html_url: string;
}

async function fetchRepo(
  owner: string,
  name: string
): Promise<GitHubRepo | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    return res.json() as Promise<GitHubRepo>;
  } catch {
    return null;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function deriveStatus(pushedAt: string): string {
  const days = (Date.now() - new Date(pushedAt).getTime()) / 86400000;
  if (days < 14) return "개발 중";
  if (days < 60) return "진행 중";
  return "유지보수";
}

function getTechs(repo: GitHubRepo): string[] {
  if (repo.topics.length > 0) return repo.topics.slice(0, 4);
  if (repo.language) return [repo.language];
  return [];
}

function RepoCard({ repo }: { repo: GitHubRepo }) {
  const techs = getTechs(repo);
  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="proj-card"
    >
      <div className="proj-status">
        <span className="proj-dot" />
        {deriveStatus(repo.pushed_at)}
      </div>
      <div className="proj-name">{repo.name}</div>
      <div className="proj-desc">{repo.description ?? "–"}</div>
      {techs.length > 0 && (
        <div className="pills" style={{ marginBottom: "12px" }}>
          {techs.map((t) => (
            <span key={t} className="pill pill-n">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="proj-foot">
        <div className="proj-commit">
          {timeAgo(repo.pushed_at)} · {repo.default_branch}
        </div>
      </div>
    </a>
  );
}

const fallbackProjects: Record<string, { description: string; language: string }> = {
  "cam-study": { description: "웹/앱으로 캠스터디 템플릿 만들기", language: "TypeScript" },
  yejilog: { description: "개인 기술 블로그", language: "TypeScript" },
  "ddeugeul-bogeul": { description: "실시간 알림이 있는 커뮤니티", language: "TypeScript" },
  "algorithm-note": { description: "풀이 기록 저장소", language: "Python" },
};

function FallbackCard({ owner, name }: { owner: string; name: string }) {
  const project = fallbackProjects[name] ?? { description: "저장소", language: "" };
  return (
    <a className="proj-card" href={`https://github.com/${owner}/${name}`} target="_blank" rel="noreferrer">
      <div className="proj-status proj-status--unavailable"><span className="proj-dot" />GitHub 정보 확인 불가</div>
      <div className="proj-name">{name}</div>
      <div className="proj-desc">{project.description}</div>
      {project.language && <div className="pills" style={{ marginBottom: "12px" }}><span className="pill pill-n">{project.language}</span></div>}
      <div className="proj-foot"><div className="proj-commit">로컬 프로젝트 정보</div></div>
    </a>
  );
}

export default async function ProjectsSection() {
  const owner = blogConfig.social.github;
  const repos = await Promise.all(
    blogConfig.projects.pinned.map((name) => fetchRepo(owner, name))
  );
  return (
    <section className="standalone-page" aria-labelledby="projects-title">
      <h1 id="projects-title">Projects</h1>
      <p className="page-lead">GitHub에서 가져온 저장소 목록입니다.</p>
      <div className="proj-grid">
        {repos.map((repo, index) =>
          repo ? (
            <RepoCard key={repo.id} repo={repo} />
          ) : (
            <FallbackCard
              key={blogConfig.projects.pinned[index]}
              owner={owner}
              name={blogConfig.projects.pinned[index]}
            />
          )
        )}
      </div>
    </section>
  );
}
