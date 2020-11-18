import * as React from "react";

export interface PageGridProps {}

export default function PageGrid(props: PageGridProps) {
  return <div className="page-grid" {...props} />;
}

PageGrid.displayName = "PageGrid";
