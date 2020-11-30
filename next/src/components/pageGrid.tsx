import * as React from "react";

export interface PageGridProps {}

export default function PageGrid(props: PageGridProps) {
  return <div className="page-grid">{JSON.stringify(props, null, 2)}</div>;
}

PageGrid.displayName = "PageGrid";
