import { type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type TextareaProps = Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'placeholder' | 'id' | 'required' | 'defaultValue' | 'rows'
> & {
  size?: 'md' | 'lg';
};

export default function Textarea(props: TextareaProps) {
  const { size = 'lg', ...otherProps } = props;
  const textareaCls = clsx(
    'form-control', 
    size === 'lg' ? 'form-control-lg' : undefined,
  );

  return (
    <fieldset className="form-group">
      <textarea
        className={textareaCls}
        name={props.id}
        {...props}
      />
    </fieldset>
  )
}