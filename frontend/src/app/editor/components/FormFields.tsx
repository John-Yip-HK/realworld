import { useFormStatus } from 'react-dom';

import Input from '@/app/components/Input';
import Textarea from '@/app/components/Textarea';

import TagList from './TagList';

export default function FormFields() {
  const { pending: creatingArticle } = useFormStatus();
  
  return (
    <fieldset disabled={creatingArticle}>
      <Input
        id="title"
        placeholder="Article Title"
      />
      <Input
        id="description"
        size="md"
        placeholder="What's this article about?"
      />
      <Textarea
        id="body"
        size="md"
        rows={8}
        placeholder="Write your article (in markdown)"
      />
      <TagList />
      <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
        Publish Article
      </button>
    </fieldset>
  )
}