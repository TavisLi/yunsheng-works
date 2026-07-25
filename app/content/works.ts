import { cancanLierixiaChapterOne } from "./previews/cancan-lierixia-chapter-01.js";
import { thoseLittleThingsChapterOneHans } from "./previews/those-little-things-chapter-01-hans.js";
import { thoseLittleThingsChapterOne } from "./previews/those-little-things-chapter-01.js";
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
  localizedSourceParagraphs?: Partial<Record<SiteLocale, ReadonlyArray<Paragraph>>>;
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
    id: "work_001_those_little_things",
    slug: "those-little-things",
    title: "那些有關於他的小事",
    author: "允生",
    cover: {
      src: "/those-little-things/cover-final.jpg",
      alt: "《那些有關於他的小事》封面定版",
    },
    synopsis:
      "2022 年創作的第一部長篇小說。從一把雨傘、一間咖啡店與一對雙生姊妹開始，寫青春裡被愛、虧欠、失去與重逢反覆照亮的小事。",
    publicationStatus: "長篇小說 · 2022 創作 · 尚未正式發佈",
    previewChapterCount: 1,
    introduction: {
      id: "intro_those_little_things",
      slug: "prologue",
      title: "作品前導",
      contentVersion: 1,
      paragraphs: [
        {
          id: "umbrella-begins",
          text: "很多故事不是從轟烈開始，而是從一句「可以坐這裡嗎」開始。林允生、林允西與魏自清在快下雨的下午相遇，一把傘把三個孤獨的人推向彼此。",
        },
        {
          id: "sisters-shadow",
          text: "允生與允西幾乎一模一樣，卻從小承受截然不同的愛。她們彼此依靠，也被家庭、疾病與選擇慢慢拉開距離。",
        },
        {
          id: "small-things",
          text: "那些看似微小的事，借傘、等人、遞飯、陪伴、告別，最後都成為改變一生的證據。",
        },
      ],
    },
    chapters: [
      {
        id: "chapter_001_those_little_things",
        order: 1,
        slug: "chapter-01",
        title: "第一章｜你借了我們一把傘",
        contentVersion: 1,
        sourceParagraphs: thoseLittleThingsChapterOne,
        localizedSourceParagraphs: {
          "zh-Hans": thoseLittleThingsChapterOneHans,
        },
      },
      {
        id: "chapter_002_those_little_things",
        order: 2,
        slug: "chapter-02",
        title: "第二章｜可終究我不是她",
        contentVersion: 1,
      },
      {
        id: "chapter_003_those_little_things",
        order: 3,
        slug: "chapter-03",
        title: "第三章｜我們之間千絲萬縷的喜歡",
        contentVersion: 1,
      },
      {
        id: "chapter_004_those_little_things",
        order: 4,
        slug: "chapter-04",
        title: "第四章｜日記裡的她和他",
        contentVersion: 1,
      },
      {
        id: "chapter_005_those_little_things",
        order: 5,
        slug: "chapter-05",
        title: "第五章｜她走了以後時間又一刻不前",
        contentVersion: 1,
      },
      {
        id: "chapter_006_those_little_things",
        order: 6,
        slug: "chapter-06",
        title: "第六章｜再見你時你已如荒漠一般",
        contentVersion: 1,
      },
      {
        id: "chapter_007_those_little_things",
        order: 7,
        slug: "chapter-07",
        title: "第七章｜你回來了，真好",
        contentVersion: 1,
      },
    ],
  },
  {
    id: "work_002_cancan_lierixia",
    slug: "cancan-lierixia",
    title: "燦燦烈日下",
    author: "NINI",
    cover: {
      src: "/casting-concept-ensemble.png",
      alt: "四位少年站在盛夏校園走廊的《燦燦烈日下》手繪概念圖",
    },
    synopsis:
      "一部關於友情、初戀與十年重逢的青春成長小說。在最明亮的夏天，他們學會接受失去，仍然選擇靠近。",
    publicationStatus: "長篇小說 · 2026 創作中 · 尚未正式發佈",
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

const simplifiedThoseLittleThings = {
  editorialVersion: "zh-Hans-promo-v1",
  title: "那些有关于他的小事",
  coverAlt: "《那些有关于他的小事》封面定版",
  synopsis:
    "2022 年创作的第一部长篇小说。从一把雨伞、一间咖啡店与一对双生姐妹开始，写青春里被爱、亏欠、失去与重逢反复照亮的小事。",
  publicationStatus: "长篇小说 · 2022 创作 · 尚未正式发布",
  introductionTitle: "作品前导",
  introductionParagraphs: [
    "很多故事不是从轰烈开始，而是从一句“可以坐这里吗”开始。林允生、林允西与魏自清在快下雨的下午相遇，一把伞把三个孤独的人推向彼此。",
    "允生与允西几乎一模一样，却从小承受截然不同的爱。她们彼此依靠，也被家庭、疾病与选择慢慢拉开距离。",
    "那些看似微小的事，借伞、等人、递饭、陪伴、告别，最后都成为改变一生的证据。",
  ],
  chapterTitles: [
    "第一章｜你借了我们一把伞",
    "第二章｜可终究我不是她",
    "第三章｜我们之间千丝万缕的喜欢",
    "第四章｜日记里的她和他",
    "第五章｜她走了以后时间又一刻不前",
    "第六章｜再见你时你已如荒漠一般",
    "第七章｜你回来了，真好",
  ],
} as const;

function validateLocalizedPublicContent() {
  const cancan = works.find((work) => work.slug === "cancan-lierixia");
  const thoseLittleThings = works.find((work) => work.slug === "those-little-things");
  if (!cancan || !thoseLittleThings) {
    throw new Error("Public work configuration is missing");
  }
  if (
    !simplifiedCancan.editorialVersion ||
    simplifiedCancan.introductionParagraphs.length !== cancan.introduction.paragraphs.length ||
    simplifiedCancan.chapterTitles.length !== cancan.chapters.length ||
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
    throw new Error("zh-Hans Cancan public content is incomplete; release is blocked");
  }
  if (
    !simplifiedThoseLittleThings.editorialVersion ||
    simplifiedThoseLittleThings.introductionParagraphs.length !==
      thoseLittleThings.introduction.paragraphs.length ||
    simplifiedThoseLittleThings.chapterTitles.length !== thoseLittleThings.chapters.length ||
    [
      simplifiedThoseLittleThings.title,
      simplifiedThoseLittleThings.coverAlt,
      simplifiedThoseLittleThings.synopsis,
      simplifiedThoseLittleThings.publicationStatus,
      simplifiedThoseLittleThings.introductionTitle,
      ...simplifiedThoseLittleThings.introductionParagraphs,
      ...simplifiedThoseLittleThings.chapterTitles,
    ].some((value) => !value.trim())
  ) {
    throw new Error("zh-Hans Those Little Things public content is incomplete; release is blocked");
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
  const sourceParagraphs = chapter.localizedSourceParagraphs?.[locale] ?? chapter.sourceParagraphs;
  if (locale === "zh-Hans" && work.slug === "cancan-lierixia") return "preparing";
  return sourceParagraphs?.length ? "preview" : "preparing";
}

function toPublicWork(work: WorkDefinition, locale: SiteLocale): PublicWork {
  const simplifiedCancanWork = locale === "zh-Hans" && work.slug === "cancan-lierixia";
  const simplifiedThoseLittleThingsWork =
    locale === "zh-Hans" && work.slug === "those-little-things";
  const localizedWork = simplifiedThoseLittleThingsWork
    ? simplifiedThoseLittleThings
    : simplifiedCancanWork
      ? simplifiedCancan
      : undefined;
  return {
    id: work.id,
    slug: work.slug,
    title: localizedWork?.title ?? work.title,
    author: work.author,
    cover: localizedWork ? { ...work.cover, alt: localizedWork.coverAlt } : work.cover,
    synopsis: localizedWork?.synopsis ?? work.synopsis,
    publicationStatus: localizedWork?.publicationStatus ?? work.publicationStatus,
    previewChapterCount: work.previewChapterCount,
    introduction: {
      id: work.introduction.id,
      number: locale === "zh-Hans" ? "前导" : "前導",
      slug: work.introduction.slug,
      title: localizedWork?.introductionTitle ?? work.introduction.title,
      contentVersion: work.introduction.contentVersion,
      kind: "introduction",
      availability: "public",
    },
    chapters: work.chapters.map((chapter, index) => ({
      id: chapter.id,
      number: String(chapter.order).padStart(2, "0"),
      slug: chapter.slug,
      title: localizedWork?.chapterTitles[index] ?? chapter.title,
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
        const simplifiedCancanWork = locale === "zh-Hans" && work.slug === "cancan-lierixia";
        const simplifiedThoseLittleThingsWork =
          locale === "zh-Hans" && work.slug === "those-little-things";
        const localizedWork = simplifiedThoseLittleThingsWork
          ? simplifiedThoseLittleThings
          : simplifiedCancanWork
            ? simplifiedCancan
            : undefined;
        return {
          id: work.introduction.id,
          number: locale === "zh-Hans" ? "前导" : "前導",
          slug: work.introduction.slug,
          title: localizedWork?.introductionTitle ?? work.introduction.title,
          contentVersion: work.introduction.contentVersion,
          kind: "introduction",
          availability: "public",
          paragraphs: localizedWork
            ? work.introduction.paragraphs.map((paragraph, index) => ({
                ...paragraph,
                text: localizedWork.introductionParagraphs[index],
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
        title: locale === "zh-Hans" && work.slug === "those-little-things"
          ? simplifiedThoseLittleThings.chapterTitles[chapter.order - 1]
          : locale === "zh-Hans" && work.slug === "cancan-lierixia"
            ? simplifiedCancan.chapterTitles[chapter.order - 1]
            : chapter.title,
        contentVersion: chapter.contentVersion,
        kind: "chapter",
        availability,
        paragraphs:
          availability === "preview"
            ? chapter.localizedSourceParagraphs?.[locale] ?? chapter.sourceParagraphs
            : undefined,
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
