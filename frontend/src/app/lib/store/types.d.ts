interface AuthSlice {
  authToken?: string;

  setAuthToken: (token: string) => void;
  resetToken: () => void;
}

interface TagSlice {
  /** Assume it is a single English word. */
  selectedTag?: string;

  setTag: (tag: string) => void;
  resetTag: () => void;
}

interface ArticleSlice {
  numArticles: number;
  pageNum: number;
  articles: Article[];

  setNumArticles: (numArticles: number) => void;
  setPageNum: (pageNum: number) => void;
  setArticles: (articles: Article[]) => void;
}

type AppStore = AuthSlice & TagSlice & ArticleSlice;
