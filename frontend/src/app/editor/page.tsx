import { serverFetchUser } from '../lib/article/serverFetchUser';
import EditorFormContainer from './components/EditorFormContainer';


export default async function NewArticlePage() {
  const { username } = await serverFetchUser();
  
  return <EditorFormContainer username={username} />;
}
