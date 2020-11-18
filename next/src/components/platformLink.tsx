import * as React from "react";

export interface PlatformLinkProps {}

export default function PlatformLink(props: PlatformLinkProps) {
  return <a {...props} />;
}

PlatformLink.displayName = "PlatformLink";
