import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancanScenes, getCancanScene } from "../../../../content/scenes";

type ScenePageProps = {
  params: Promise<{ sceneSlug: string }>;
};

export function generateStaticParams() {
  return cancanScenes.map(({ slug }) => ({ sceneSlug: slug }));
}

export async function generateMetadata({ params }: ScenePageProps): Promise<Metadata> {
  const { sceneSlug } = await params;
  const scene = getCancanScene(sceneSlug);

  if (!scene) return { title: "找不到場景｜燦燦烈日下" };
  return {
    title: `${scene.title}｜燦燦烈日下`,
    description: scene.copy,
  };
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { sceneSlug } = await params;
  const scene = getCancanScene(sceneSlug);
  if (!scene) notFound();

  const sceneIndex = cancanScenes.findIndex(({ slug }) => slug === scene.slug);
  const previous = cancanScenes[(sceneIndex + cancanScenes.length - 1) % cancanScenes.length];
  const next = cancanScenes[(sceneIndex + 1) % cancanScenes.length];

  return (
    <main className="sceneDetailPage">
      <nav className="sceneDetailNav" aria-label="場景導覽">
        <Link href="/works/cancan-lierixia#scenes">← 返回三個場景</Link>
        <Link href="/" className="wordmark">允生作品</Link>
      </nav>

      <figure className="sceneDetailHero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={scene.detailImage} alt={scene.detailImageAlt} />
        <figcaption>
          <span>SCENE {scene.number}</span>
          <strong>{scene.title}</strong>
        </figcaption>
      </figure>

      <article className="sceneDetailArticle">
        <header>
          <p className="sceneDetailSource">{scene.sourceLabel}</p>
          <h1>{scene.title}</h1>
          <blockquote>{scene.lead}</blockquote>
          <div className="sceneParticipants" aria-label="本場景人物">
            <span>本場景人物</span>
            <p>{scene.participants.join(" · ")}</p>
          </div>
        </header>

        <div className="sceneExcerpt">
          {scene.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <p className="sceneDraftNote">
          {scene.isDraft
            ? "本頁節選自後續創作草稿，經網頁排版校訂；情節仍可能隨正式定稿調整。"
            : "本頁節選自作者確認的第一章完稿內容；完整章節可由免費試讀繼續閱讀。"}
        </p>
      </article>

      <nav className="sceneDetailPagination" aria-label="切換場景">
        <Link href={`/works/cancan-lierixia/scenes/${previous.slug}`}>
          <span>上一幕</span>
          <strong>{previous.title}</strong>
        </Link>
        <Link href={`/works/cancan-lierixia/scenes/${next.slug}`}>
          <span>下一幕</span>
          <strong>{next.title}</strong>
        </Link>
      </nav>
    </main>
  );
}
