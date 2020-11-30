import * as React from "react";

export interface ConfigKeyProps {}

export default function ConfigKey(props: ConfigKeyProps) {
  return <div className="config-key" {...props} />;
}

ConfigKey.displayName = "ConfigKey";
