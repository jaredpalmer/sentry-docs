import * as React from "react";
// import { withPrefix } from "gatsby";
import { useRouter } from "next/router";

// import { useLocation } from "@reach/router";

import SmartLink from "./smartLink";

type Props = {
  to: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  collapsed?: boolean | null;
};

export default function SidebarLink({
  to,
  title,
  children,
  collapsed = null,
  className = "",
}: Props): JSX.Element {
  const router = useRouter();
  // const isActive = location && location.pathname.indexOf(withPrefix(to)) === 0;
  const isActive = router.asPath.indexOf(to) === 0;

  className += " toc-item";
  if (isActive || collapsed === false) {
    className += " toc-visible";
  }

  return (
    <li className={className} data-sidebar-branch>
      <SmartLink to={to} className="d-block" data-sidebar-link>
        {title || children}
      </SmartLink>
      {title && children && (
        <ul className="list-unstyled" data-sidebar-tree>
          {children}
        </ul>
      )}
    </li>
  );
}
