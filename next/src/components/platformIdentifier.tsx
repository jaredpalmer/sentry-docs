import * as React from "react";

export type PlatformIdentiferProps = {
  children: React.ReactNode;
};

export default function PlatformIdentifer(props: PlatformIdentiferProps) {
  return <div className="platform-content">{props.children}</div>;
}

PlatformIdentifer.displayName = "PlatformIdentifer";
