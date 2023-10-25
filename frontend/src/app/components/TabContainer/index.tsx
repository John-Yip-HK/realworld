import { type PropsWithChildren } from 'react'

type TabContainerProps = PropsWithChildren;

export default function TabContainer({
  children,
}: TabContainerProps) {
  return (
    <ul className="nav nav-pills outline-active">
      {children}
    </ul>
  )
}
