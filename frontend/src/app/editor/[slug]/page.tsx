import { serverFetchArticle } from '@/app/lib/article/serverFetchArticle';
import { serverFetchUser } from '@/app/lib/article/serverFetchUser';

import EditorFormContainer from '../components/EditorFormContainer'

type ArticleEditorPageProps = {
  params: { slug: string; };
}

export default async function ArticleEditorPage({ params: { slug } }: ArticleEditorPageProps) {
  const { username } = await serverFetchUser();
  const { article } = await serverFetchArticle(slug);

  const { title, description, body, tagList } = article;
  const defaultFormValues: FormDefaultValues & { slug: string; } = { title, description, body, tagList, slug };
  
  return <EditorFormContainer 
    username={username} 
    formDefaultValues={defaultFormValues} 
  />;
}