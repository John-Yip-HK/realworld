import { fetchFromServer } from '@/app/lib/api/fetchFromServer';
import { serverFetchArticle } from '@/app/lib/article/serverFetchArticle';
import { serverFetchArticleComments } from '@/app/lib/article/serverFetchArticleComments';

import ArticleContainer from './components/ArticleContainer';

import { USER_PATH } from '@/app/constants/user';

type ArticleProps = {
  params: { slug: string; };
};

export default async function Article({ params: { slug } }: ArticleProps) {
  const { article, isLoggedIn } = await serverFetchArticle(slug);
  const { comments } = await serverFetchArticleComments(slug);

  let user: User = { 
    username: '',
    email: '',
    token: '',
    bio: '', 
    image: '',
  };

  if (isLoggedIn) {
    const userResponse = (await fetchFromServer(USER_PATH) as GetUserResponse);

    if (!('user' in userResponse)) {
      const jsonError = 'errors' in userResponse ? userResponse.errors : userResponse;
          
      throw new Error(JSON.stringify(jsonError));
    }

    ({ user } = userResponse);
  }

  const isOwnerVisitingArticle = 
    isLoggedIn && 
    user.username === article.author.username;
  const { username, image: userImageUrl, } = user;

  return (
    <div className="article-page">
      <ArticleContainer
        article={article}
        comments={comments}
        username={username}
        userImageUrl={userImageUrl}
        isLoggedIn={isLoggedIn}
        isOwnerVisitingArticle={isOwnerVisitingArticle}
      />
    </div>
  )
}
