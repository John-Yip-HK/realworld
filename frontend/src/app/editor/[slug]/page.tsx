import path from 'path';

import { type Metadata } from 'next';

import { serverFetchArticle } from '@/app/lib/article/serverFetchArticle';
import { serverFetchUser } from '@/app/lib/article/serverFetchUser';
import { concatenateTitleDynamicBlock } from '@/app/lib/utils';

import EditorFormContainer from '../components/EditorFormContainer'

import { EDIT_ARTICLE_TITLE } from '@/app/constants/title';
import { fetchFromServer } from '@/app/lib/api/fetchFromServer';
import { ARTICLES_PATH } from '@/app/api/constants';

export const metadata: Metadata = {
  title: EDIT_ARTICLE_TITLE,
}

type MetadataProps = {
  params: { slug: string };
}

export async function generateMetadata(
  { params }: MetadataProps
  ): Promise<Metadata> {
  const { slug } = params;
  const title = slug ?
    await (async () => {
      let normalisedSlug = slug;

      try {
        const getArticle = await fetchFromServer<GetArticleResponse>(path.join(ARTICLES_PATH, slug));

        if ('article' in getArticle) {
          normalisedSlug = getArticle.article.title;
        }
      } catch {}
      
      return concatenateTitleDynamicBlock(EDIT_ARTICLE_TITLE, normalisedSlug);
    })() :
    EDIT_ARTICLE_TITLE;
 
  return { title };
}

type ArticleEditorPageProps = MetadataProps;

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