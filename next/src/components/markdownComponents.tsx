import * as React from "react";
import SmartLink from "~src/components/smartLink";
import PlatformContent from "~src/components/PlatformContent";
import Note from "~src/components/note";
import Alert from "~src/components/alert";
import PlatformLink from "~src/components/platformLink";
import PageGrid from "~src/components/pageGrid";
import PlatformIdentifier from "~src/components/platformIdentifier";
import PlatformSection from "~src/components/platformSection";
import ConfigKey from "~src/components/configKey";
import PlatformContext from "./platformContext";

const H2 = (props) => {
  const { platform } = React.useContext(PlatformContext);
  return <h2>{props.children} </h2>;
};
const Code = (props) => {
  return <pre>{props.children} </pre>;
};

const components = {
  PlatformContent,
  Note,
  Alert,
  h2: H2,
  pre: (p) => <div {...p} />,
  code: Code,
  PlatformLink,
  a: SmartLink,
  PageGrid,
  PlatformIdentifier,
  PlatformSection,
  ConfigKey,
};

export default components;
