import * as React from "react";

export type PlatformContentProps = {
  children: React.ReactNode;
};

export default function PlatformContent(props: PlatformContentProps) {
  return <div className="platform-content">{props.children}</div>;
}

PlatformContent.displayName = "PlatformContent";
