import * as React from "react";

export interface NoteProps {
  children: React.ReactNode;
}

export default function Note(props: NoteProps) {
  return <div className="note">{props.children}</div>;
}

Note.displayName = "Note";
