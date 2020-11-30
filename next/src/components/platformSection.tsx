import * as React from "react";
import PlatformContext from "./platformContext";

export interface PlatformSectionProps {
  supported?: string[];
}

export default function PlatformSection({
  supported,
  ...props
}: PlatformSectionProps) {
  const { platforms } = React.useContext(PlatformContext);
  if (supported && supported.some((i) => platforms.indexOf(i) !== -1)) {
    return <div className="platfor-section" {...props} />;
  }
  return null;
}

PlatformSection.displayName = "PlatformSection";
