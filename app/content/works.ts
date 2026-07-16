export type PreviewChapterCount = 1 | 2 | 3;
export type ChapterAvailability = "preview" | "preparing" | "locked";

type Paragraph = { id: string; text: string };

type StoredChapter = {
  id: string;
  order: number;
  slug: string;
  title: string;
  contentVersion: number;
  sourceParagraphs?: ReadonlyArray<Paragraph>;
};

type StoredWork = {
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

export type PublicWork = Omit<StoredWork, "introduction" | "chapters"> & {
  introduction: PublicCatalogEntry;
  chapters: ReadonlyArray<PublicCatalogEntry>;
};

export type PublicReading = PublicCatalogEntry & {
  paragraphs?: ReadonlyArray<Paragraph>;
};

const works: ReadonlyArray<StoredWork> = [
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
        title: "第一章",
        contentVersion: 1,
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

export function isWithinPreviewLimit(
  previewChapterCount: PreviewChapterCount,
  chapterOrder: number,
) {
  return chapterOrder >= 1 && chapterOrder <= previewChapterCount;
}

function getChapterAvailability(
  work: StoredWork,
  chapter: StoredChapter,
): ChapterAvailability {
  if (!isWithinPreviewLimit(work.previewChapterCount, chapter.order)) return "locked";
  return chapter.sourceParagraphs?.length ? "preview" : "preparing";
}

function findStoredWork(slug: string) {
  return works.find((work) => work.slug === slug);
}

export function getPublicWork(slug: string): PublicWork | undefined {
  const work = findStoredWork(slug);
  if (!work) return undefined;

  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    author: work.author,
    cover: work.cover,
    synopsis: work.synopsis,
    publicationStatus: work.publicationStatus,
    previewChapterCount: work.previewChapterCount,
    introduction: {
      id: work.introduction.id,
      number: "前導",
      slug: work.introduction.slug,
      title: work.introduction.title,
      contentVersion: work.introduction.contentVersion,
      kind: "introduction",
      availability: "public",
    },
    chapters: work.chapters.map((chapter) => ({
      id: chapter.id,
      number: String(chapter.order).padStart(2, "0"),
      slug: chapter.slug,
      title: chapter.title,
      contentVersion: chapter.contentVersion,
      kind: "chapter" as const,
      availability: getChapterAvailability(work, chapter),
    })),
  };
}

export function getPublicReading(
  workSlug: string,
  readingSlug: string,
): PublicReading | undefined {
  const work = findStoredWork(workSlug);
  if (!work) return undefined;

  if (work.introduction.slug === readingSlug) {
    return {
      id: work.introduction.id,
      number: "前導",
      slug: work.introduction.slug,
      title: work.introduction.title,
      contentVersion: work.introduction.contentVersion,
      kind: "introduction",
      availability: "public",
      paragraphs: work.introduction.paragraphs,
    };
  }

  const chapter = work.chapters.find(({ slug }) => slug === readingSlug);
  if (!chapter) return undefined;
  const availability = getChapterAvailability(work, chapter);

  return {
    id: chapter.id,
    number: String(chapter.order).padStart(2, "0"),
    slug: chapter.slug,
    title: chapter.title,
    contentVersion: chapter.contentVersion,
    kind: "chapter",
    availability,
    paragraphs: availability === "preview" ? chapter.sourceParagraphs : undefined,
  };
}
