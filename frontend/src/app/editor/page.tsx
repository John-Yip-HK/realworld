import { type Metadata } from 'next';

import { serverFetchUser } from '../lib/article/serverFetchUser';
import EditorFormContainer from './components/EditorFormContainer';

import { EDITOR_TITLE } from '../constants/title';

export const metadata: Metadata = {
  title: EDITOR_TITLE,
}

export default async function NewArticlePage() {
  const { username } = await serverFetchUser();
  
  return <EditorFormContainer username={username} />;
}
