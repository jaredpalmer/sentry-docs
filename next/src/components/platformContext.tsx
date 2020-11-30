import * as React from "react";

export interface PlatformContextType {
  platform: any;
  platforms: any;
  guide: string;
  frontMatter: any;
}

const PlatformContext = React.createContext<PlatformContextType>({} as any);

export default PlatformContext;
