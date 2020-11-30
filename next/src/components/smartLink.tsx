import * as React from "react";
import Link from "next/link";
import ExternalLink from "./externalLink";

type Props = {
  href?: string;
  remote?: boolean;
  children?: React.ReactNode;
  activeClassName?: string;
  className?: string;
  title?: string;
};

export default function SmartLink({
  href,
  children,
  activeClassName = "active",
  remote = false,
  className = "",
  to,
  ...props
}: Props): JSX.Element {
  const realTo = href || to || "";
  if (realTo.indexOf("://") !== -1) {
    return (
      <ExternalLink href={realTo} className={className} {...props}>
        {children || href}
      </ExternalLink>
    );
  } else if (realTo.indexOf("/") !== 0 || remote) {
    // this handles cases like anchor tags (where Link messes thats up)
    return (
      <a href={realTo} className={`relative-link ${className}`} {...props}>
        {children || href}
      </a>
    );
  }
  // const isActive = asPath === realTo;

  return (
    <a href={realTo} {...props} className={`relative-link ${className}`}>
      {children || href}
    </a>
  );
}
