import { type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type InputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'placeholder' | 'id' | 'required' | 'defaultValue'
> & {
  size?: 'md' | 'lg';
};

export default function Input(props: InputProps) {
  const { size = 'lg', ...otherProps } = props;
  const inputCls = clsx(
    'form-control', 
    size === 'lg' ? 'form-control-lg' : undefined,
  );
  
  return (
    <fieldset className="form-group">
      <input
        className={inputCls}
        type="text"
        name={otherProps.id}
        {...otherProps}
      />
    </fieldset>
  )
}