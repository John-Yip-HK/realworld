import React, { type TextareaHTMLAttributes } from 'react'

type TextareaProps = Pick<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'placeholder' | 'id' | 'required' | 'defaultValue' | 'rows'
>

export default function Textarea(props: TextareaProps) {
  return (
    <fieldset className="form-group">
      <textarea
        className="form-control form-control-lg"
        name={props.id}
        {...props}
      />
    </fieldset>
  )
}