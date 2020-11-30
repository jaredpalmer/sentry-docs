import * as React from "react";
import PlatformContext from "./platformContext";

export interface PlatformSectionProps {
  supported: string[];
}

export default function PlatformSection({
  supported,
  ...props
}: PlatformSectionProps) {
  const { platform } = React.useContext(PlatformContext);
  if (supported.indexOf(platform) === -1) {
    return null;
  }
  return <div className="platfor-section" {...props} />;
}

PlatformSection.displayName = "PlatformSection";
