import { useFormStatus } from 'react-dom';

import Input from '@/app/components/Input';
import Textarea from '@/app/components/Textarea';

import TagList from './TagList';

interface FormFieldsProps {
  formDefaultValues?: FormDefaultValues;
}

export default function FormFields({
  formDefaultValues
}: FormFieldsProps) {
  const { pending: mutatingArticle } = useFormStatus();
  let title: Article['title'] = '';
  let description: Article['description'] = '';
  let body: Article['body'] = '';
  let tagList: Article['tagList'] = [];

  if (formDefaultValues) {
    ({ title, description, body, tagList } = formDefaultValues);
  }
  
  return (
    <fieldset disabled={mutatingArticle}>
      <Input
        id="title"
        placeholder="Title"
        defaultValue={title}
      />
      <Input
        id="description"
        size="md"
        placeholder="Description: What's this article about?"
        defaultValue={description}
      />
      <Textarea
        id="body"
        size="md"
        rows={8}
        placeholder="Body: Write your article (in markdown)"
        defaultValue={body}
      />
      <TagList defaultValue={tagList} />
      <button className="btn btn-lg pull-xs-right btn-primary" type="submit">
        {formDefaultValues ? 'Update' : 'Publish'} Article
      </button>
    </fieldset>
  )
}