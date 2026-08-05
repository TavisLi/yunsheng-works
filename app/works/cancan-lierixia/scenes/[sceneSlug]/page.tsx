import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cancanScenes, getCancanScene } from "../../../../content/scenes";
import { cancanScenes as simplifiedScenes, getCancanScene as getSimplifiedScene } from "../../../../content/scenes-hans";
import { localePath, localized, localizedMetadataAlternates } from "../../../../i18n";
import LanguageSwitcher from "../../../../language-switcher";
import { getRequestLocale } from "../../../../request-locale";

type ScenePageProps = {
  params: Promise<{ sceneSlug: string }>;
};

export function generateStaticParams() {
  return cancanScenes.map(({ slug }) => ({ sceneSlug: slug }));
}

export async function generateMetadata({ params }: ScenePageProps): Promise<Metadata> {
  const { sceneSlug } = await params;
  const locale = await getRequestLocale();
  const scene = locale === "zh-Hans" ? getSimplifiedScene(sceneSlug) : getCancanScene(sceneSlug);

  const workTitle = localized(locale, "燦燦烈日下", "灿灿烈日下");
  if (!scene) return { title: `${localized(locale, "找不到場景", "找不到场景")}｜${workTitle}` };
  return {
    title: `${scene.title}｜${workTitle}`,
    description: scene.copy,
    alternates: localizedMetadataAlternates(`/works/cancan-lierixia/scenes/${sceneSlug}`),
  };
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { sceneSlug } = await params;
  const locale = await getRequestLocale();
  const copy = <T,>(traditional: T, simplified: T) => localized(locale, traditional, simplified);
  const scenes = locale === "zh-Hans" ? simplifiedScenes : cancanScenes;
  const scene = locale === "zh-Hans" ? getSimplifiedScene(sceneSlug) : getCancanScene(sceneSlug);
  if (!scene) notFound();

  const sceneIndex = scenes.findIndex(({ slug }) => slug === scene.slug);
  const previous = scenes[(sceneIndex + scenes.length - 1) % scenes.length];
  const next = scenes[(sceneIndex + 1) % scenes.length];

  return (
    <main className="sceneDetailPage">
      <nav className="sceneDetailNav" aria-label="場景導覽">
        <Link href={`${localePath(locale, "/works/cancan-lierixia")}#scenes`}>← {copy("返回三個場景", "返回三个场景")}</Link>
        <Link href={localePath(locale)} className="wordmark">允生作品</Link>
        <LanguageSwitcher locale={locale} path={`/works/cancan-lierixia/scenes/${scene.slug}`} />
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
          <div className="sceneParticipants" aria-label={copy("本場景人物", "本场景人物")}>
            <span>{copy("本場景人物", "本场景人物")}</span>
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
            ? copy("本頁節選自後續創作草稿，經網頁排版校訂；情節仍可能隨正式定稿調整。", "本页节选自后续创作草稿，经网页排版校订；情节仍可能随正式定稿调整。")
            : copy("本頁節選自作者確認的第一章完稿內容；完整章節可由免費試讀繼續閱讀。", "本页节选自作者确认的第一章完稿内容；完整章节待简体内容审校后开放。")}
        </p>
      </article>

      <nav className="sceneDetailPagination" aria-label="切換場景">
        <Link href={localePath(locale, `/works/cancan-lierixia/scenes/${previous.slug}`)}>
          <span>{copy("上一幕", "上一幕")}</span>
          <strong>{previous.title}</strong>
        </Link>
        <Link href={localePath(locale, `/works/cancan-lierixia/scenes/${next.slug}`)}>
          <span>{copy("下一幕", "下一幕")}</span>
          <strong>{next.title}</strong>
        </Link>
      </nav>
    </main>
  );
}
