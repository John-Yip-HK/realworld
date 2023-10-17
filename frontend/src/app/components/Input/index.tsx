import { type InputHTMLAttributes } from 'react'

type InputProps = Pick<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'placeholder' | 'id' | 'required'
>;

export default function Input(props: InputProps) {
  return (
    <fieldset className="form-group">
      <input
        className="form-control form-control-lg"
        type="text"
        name={props.id}
        {...props}
      />
    </fieldset>
  )
}