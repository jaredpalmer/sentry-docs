import * as React from "react";
import SmartLink from "./smartLink";

export interface PlatformLinkProps {
  to: string;
}

export default function PlatformLink({ to, ...props }: PlatformLinkProps) {
  return <SmartLink href={to} {...props} />;
}

PlatformLink.displayName = "PlatformLink";
