import { getJsonFetch } from "@/app/lib/api/customFetch";
import ArticlePreview from "./components/ArticlePreview";

async function getArticles() {
  // TODO: Dynamically change URL hostname in different NODE_ENV values.
  const getArticlesPromise = getJsonFetch('http://localhost:3000/api/articles', {
    loggedIn: false,
  });
  const getArticlesResponse: GetArticlesResponse = await getArticlesPromise;

  return getArticlesResponse;
}

export default async function ArticlePreviews() {
  const articlesResponse = await getArticles();

  if ('articles' in articlesResponse) {
    const { articles } = articlesResponse;

    return articles.map(article => (
      <ArticlePreview article={article} key={article.slug} />
    ));
  } else {
    // TODO: Handle it later.
    throw new Error(articlesResponse.errors.toString());
  }
  
}
