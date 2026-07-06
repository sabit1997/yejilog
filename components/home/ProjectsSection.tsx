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

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="11"
      height="11"
      fill="var(--dim)"
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38l-.01-1.49c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.17-.89-1.17-.72-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 014 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
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
          <GitHubIcon />
          {timeAgo(repo.pushed_at)} · {repo.default_branch}
        </div>
      </div>
    </a>
  );
}

export default async function ProjectsSection() {
  const owner = blogConfig.social.github;
  const repos = await Promise.all(
    blogConfig.projects.pinned.map((name) => fetchRepo(owner, name))
  );
  const validRepos = repos.filter((r): r is GitHubRepo => r !== null);

  if (validRepos.length === 0) return null;

  return (
    <section className="section" id="projects">
      <div className="section-head">
        <span className="section-tag">{"// projects"}</span>
      </div>
      <div className="proj-grid">
        {validRepos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>
    </section>
  );
}
