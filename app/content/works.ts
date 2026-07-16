export type PublicChapter = {
  number: string;
  slug: string;
  title: string;
  availability: "preview" | "preparing" | "locked";
  paragraphs?: ReadonlyArray<{ id: string; text: string }>;
};

export type PublicWork = {
  slug: string;
  title: string;
  chapters: ReadonlyArray<PublicChapter>;
};

const works: ReadonlyArray<PublicWork> = [
  {
    slug: "cancan-lierixia",
    title: "燦燦烈日下",
    chapters: [
      {
        number: "前導",
        slug: "prologue",
        title: "作品前導",
        availability: "preview",
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
      {
        number: "01",
        slug: "chapter-01",
        title: "第一章",
        availability: "preparing",
      },
      {
        number: "02",
        slug: "chapter-02",
        title: "第二章",
        availability: "locked",
      },
      {
        number: "03",
        slug: "chapter-03",
        title: "第三章",
        availability: "locked",
      },
    ],
  },
];

export function getPublicWork(slug: string) {
  return works.find((work) => work.slug === slug);
}

export function getPublicChapter(workSlug: string, chapterSlug: string) {
  return getPublicWork(workSlug)?.chapters.find(
    (chapter) => chapter.slug === chapterSlug,
  );
}
