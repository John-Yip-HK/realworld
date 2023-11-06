import { clsx } from 'clsx';
import { type ButtonHTMLAttributes, type PropsWithChildren } from 'react';

export type OutlinedButtonProps = PropsWithChildren<Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'> & {
  size?: 'sm' | 'lg';
  type?: 'primary' | 'secondary' | 'danger';
  className?: string;
}>;

export default function OutlinedButton({
  size, type, children, className, ...buttonProps
}: OutlinedButtonProps) {
  const btnCls = clsx(
    'btn',
    size ? `btn-${size}` : undefined,
    type ? `btn-outline-${type}` : undefined,
    className
  );
  
  return (
    <button className={btnCls} {...buttonProps}>
      {children}
    </button>
  )
}