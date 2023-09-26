import { type ReactElement } from "react";

type NavLinkProps = {
  href: string;
  children: string | ReactElement;
  protectedLink: boolean;
}