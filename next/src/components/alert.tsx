import * as React from "react";

export interface AlertProps {
  children: React.ReactNode;
}

export default function Alert(props: AlertProps) {
  return <div className="Alert">{props.children}</div>;
}

Alert.displayName = "Alert";
