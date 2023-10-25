interface TagSlice {
  /** Assume it is an array of single-word English words. */
  tags: string[];

  setTags: (tags: string[]) => void;
  resetTags: () => void;
}

interface ArticleSlice {
  numArticles: number;
  pageNum: number;

  setNumArticles: (numArticles: number) => void;
  setPageNum: (pageNum: number) => void;
}

interface MainPageTabSlice {
  selectedTab: string;

  setSelectedTab: (tab: string) => void;
  resetSelectedTab: () => void;
}

type AppStore = TagSlice & ArticleSlice & MainPageTabSlice;
