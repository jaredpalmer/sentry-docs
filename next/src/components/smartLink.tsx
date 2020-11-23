import React from "react";
import Link from "next/link";
import ExternalLink from "./externalLink";
import { useRouter } from "next/router";

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
  ...props
}: Props): JSX.Element {
  const router = useRouter();
  const realTo = href || "";
  if (realTo.indexOf("://") !== -1) {
    return (
      <ExternalLink href={realTo} className={className} {...props}>
        {children || href}
      </ExternalLink>
    );
  } else if (realTo.indexOf("/") !== 0 || remote) {
    // this handles cases like anchor tags (where Link messes thats up)
    return (
      <a href={realTo} className={className} {...props}>
        {children || href}
      </a>
    );
  }
  const isActive = router.pathname === realTo;
  return (
    <Link href={realTo}>
      <a
        {...props}
        className={isActive ? `${activeClassName} ${className}` : className}
      >
        {children || href}
      </a>
    </Link>
  );
}
