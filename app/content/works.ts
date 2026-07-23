import { cancanLierixiaChapterOne } from "./previews/cancan-lierixia-chapter-01.js";
import type { SiteLocale } from "../i18n";

export type PreviewChapterCount = 1 | 2 | 3;
export type ChapterAvailability = "preview" | "preparing" | "locked";

export type Paragraph = { id: string; text: string };

type StoredChapter = {
  id: string;
  order: number;
  slug: string;
  title: string;
  contentVersion: number;
  sourceParagraphs?: ReadonlyArray<Paragraph>;
};

export type WorkDefinition = {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover: { src: string; alt: string };
  synopsis: string;
  publicationStatus: string;
  previewChapterCount: PreviewChapterCount;
  introduction: {
    id: string;
    slug: string;
    title: string;
    contentVersion: number;
    paragraphs: ReadonlyArray<Paragraph>;
  };
  chapters: ReadonlyArray<StoredChapter>;
};

export type PublicCatalogEntry = {
  id: string;
  number: string;
  slug: string;
  title: string;
  contentVersion: number;
  kind: "introduction" | "chapter";
  availability: "public" | ChapterAvailability;
};

export type PublicWork = Omit<WorkDefinition, "introduction" | "chapters"> & {
  introduction: PublicCatalogEntry;
  chapters: ReadonlyArray<PublicCatalogEntry>;
};

export type PublicReading = PublicCatalogEntry & {
  paragraphs?: ReadonlyArray<Paragraph>;
};

const works: ReadonlyArray<WorkDefinition> = [
  {
    id: "work_001_cancan_lierixia",
    slug: "cancan-lierixia",
    title: "燦燦烈日下",
    author: "NINI",
    cover: {
      src: "/casting-concept-ensemble.png",
      alt: "四位少年站在盛夏校園走廊的《燦燦烈日下》手繪概念圖",
    },
    synopsis:
      "一部關於友情、初戀與十年重逢的青春成長小說。在最明亮的夏天，他們學會接受失去，仍然選擇靠近。",
    publicationStatus: "長篇小說 · 創作中",
    previewChapterCount: 1,
    introduction: {
      id: "intro_cancan_lierixia",
      slug: "prologue",
      title: "作品前導",
      contentVersion: 1,
      paragraphs: [
        {
          id: "summer-begins",
          text: "何念恩和許承恩從彼此的少年時代穿過。他們太熟悉對方，熟悉到每一次靠近都像理所當然，每一次退後也都來不及追問。",
        },
        {
          id: "friendship-and-safety",
          text: "莊梔讓她明白，友情同樣可以是一生的命題；江遇則在成年後告訴她，真正安全的關係不需要反覆猜測。",
        },
        {
          id: "ten-years-later",
          text: "十年後，一只時間膠囊把所有人重新帶回那個盛夏。他們終於明白，接受失去，並不等於停止珍惜。",
        },
      ],
    },
    chapters: [
      {
        id: "chapter_001_cancan_lierixia",
        order: 1,
        slug: "chapter-01",
        title: "第一章｜致一如初見的你們",
        contentVersion: 2,
        sourceParagraphs: cancanLierixiaChapterOne,
      },
      {
        id: "chapter_002_cancan_lierixia",
        order: 2,
        slug: "chapter-02",
        title: "第二章",
        contentVersion: 1,
        // Synthetic sentinel proves locked server content never reaches a response.
        sourceParagraphs: [
          {
            id: "server-only-test-sentinel",
            text: "SERVER_ONLY_LOCKED_CHAPTER_SENTINEL_7F3A",
          },
        ],
      },
      {
        id: "chapter_003_cancan_lierixia",
        order: 3,
        slug: "chapter-03",
        title: "第三章",
        contentVersion: 1,
      },
    ],
  },
];

const simplifiedCancan = {
  editorialVersion: "zh-Hans-promo-v1",
  title: "灿灿烈日下",
  coverAlt: "四位少年站在盛夏校园走廊的《燦燦烈日下》手绘概念图",
  synopsis: "一部关于友情、初恋与十年重逢的青春成长小说。在最明亮的夏天，他们学会接受失去，仍然选择靠近。",
  publicationStatus: "长篇小说 · 创作中",
  introductionTitle: "作品前导",
  introductionParagraphs: [
    "何念恩和许承恩从彼此的少年时代穿过。他们太熟悉对方，熟悉到每一次靠近都像理所当然，每一次退后也都来不及追问。",
    "庄栀让她明白，友情同样可以是一生的命题；江遇则在成年后告诉她，真正安全的关系不需要反复猜测。",
    "十年后，一只时间胶囊把所有人重新带回那个盛夏。他们终于明白，接受失去，并不等于停止珍惜。",
  ],
  chapterTitles: ["第一章｜致一如初见的你们", "第二章", "第三章"],
} as const;

function validateLocalizedPublicContent() {
  const source = works[0];
  if (
    !simplifiedCancan.editorialVersion ||
    simplifiedCancan.introductionParagraphs.length !== source.introduction.paragraphs.length ||
    simplifiedCancan.chapterTitles.length !== source.chapters.length ||
    [
      simplifiedCancan.title,
      simplifiedCancan.coverAlt,
      simplifiedCancan.synopsis,
      simplifiedCancan.publicationStatus,
      simplifiedCancan.introductionTitle,
      ...simplifiedCancan.introductionParagraphs,
      ...simplifiedCancan.chapterTitles,
    ].some((value) => !value.trim())
  ) {
    throw new Error("zh-Hans public content is incomplete; release is blocked");
  }
}

validateLocalizedPublicContent();

export function isWithinPreviewLimit(
  previewChapterCount: PreviewChapterCount,
  chapterOrder: number,
) {
  return chapterOrder >= 1 && chapterOrder <= previewChapterCount;
}

function getChapterAvailability(
  work: WorkDefinition,
  chapter: StoredChapter,
  locale: SiteLocale,
): ChapterAvailability {
  if (!isWithinPreviewLimit(work.previewChapterCount, chapter.order)) return "locked";
  if (locale === "zh-Hans") return "preparing";
  return chapter.sourceParagraphs?.length ? "preview" : "preparing";
}

function toPublicWork(work: WorkDefinition, locale: SiteLocale): PublicWork {
  const simplified = locale === "zh-Hans" && work.slug === "cancan-lierixia";
  return {
    id: work.id,
    slug: work.slug,
    title: simplified ? simplifiedCancan.title : work.title,
    author: work.author,
    cover: simplified ? { ...work.cover, alt: simplifiedCancan.coverAlt } : work.cover,
    synopsis: simplified ? simplifiedCancan.synopsis : work.synopsis,
    publicationStatus: simplified ? simplifiedCancan.publicationStatus : work.publicationStatus,
    previewChapterCount: work.previewChapterCount,
    introduction: {
      id: work.introduction.id,
      number: simplified ? "前导" : "前導",
      slug: work.introduction.slug,
      title: simplified ? simplifiedCancan.introductionTitle : work.introduction.title,
      contentVersion: work.introduction.contentVersion,
      kind: "introduction",
      availability: "public",
    },
    chapters: work.chapters.map((chapter, index) => ({
      id: chapter.id,
      number: String(chapter.order).padStart(2, "0"),
      slug: chapter.slug,
      title: simplified ? simplifiedCancan.chapterTitles[index] : chapter.title,
      contentVersion: chapter.contentVersion,
      kind: "chapter" as const,
      availability: getChapterAvailability(work, chapter, locale),
    })),
  };
}

export function createWorkRegistry(definitions: ReadonlyArray<WorkDefinition>) {
  return {
    list(locale: SiteLocale = "zh-Hant"): ReadonlyArray<PublicWork> {
      return definitions.map((work) => toPublicWork(work, locale));
    },
    getWork(slug: string, locale: SiteLocale = "zh-Hant"): PublicWork | undefined {
      const work = definitions.find((definition) => definition.slug === slug);
      return work ? toPublicWork(work, locale) : undefined;
    },
    getReading(
      workSlug: string,
      readingSlug: string,
      locale: SiteLocale = "zh-Hant",
    ): PublicReading | undefined {
      const work = definitions.find(
        (definition) => definition.slug === workSlug,
      );
      if (!work) return undefined;

      if (work.introduction.slug === readingSlug) {
        return {
          id: work.introduction.id,
          number: locale === "zh-Hans" ? "前导" : "前導",
          slug: work.introduction.slug,
          title: locale === "zh-Hans" ? simplifiedCancan.introductionTitle : work.introduction.title,
          contentVersion: work.introduction.contentVersion,
          kind: "introduction",
          availability: "public",
          paragraphs: locale === "zh-Hans"
            ? work.introduction.paragraphs.map((paragraph, index) => ({
                ...paragraph,
                text: simplifiedCancan.introductionParagraphs[index],
              }))
            : work.introduction.paragraphs,
        };
      }

      const chapter = work.chapters.find(({ slug }) => slug === readingSlug);
      if (!chapter) return undefined;
      const availability = getChapterAvailability(work, chapter, locale);

      return {
        id: chapter.id,
        number: String(chapter.order).padStart(2, "0"),
        slug: chapter.slug,
        title: locale === "zh-Hans"
          ? simplifiedCancan.chapterTitles[chapter.order - 1]
          : chapter.title,
        contentVersion: chapter.contentVersion,
        kind: "chapter",
        availability,
        paragraphs:
          availability === "preview" ? chapter.sourceParagraphs : undefined,
      };
    },
  };
}

const publicWorks = createWorkRegistry(works);

export function getPublicWorks(locale: SiteLocale = "zh-Hant") {
  return publicWorks.list(locale);
}

export function getPublicWork(slug: string, locale: SiteLocale = "zh-Hant") {
  return publicWorks.getWork(slug, locale);
}

export function getPublicReading(workSlug: string, readingSlug: string, locale: SiteLocale = "zh-Hant") {
  return publicWorks.getReading(workSlug, readingSlug, locale);
}
