import NextImage from "next/image";
import qs from "qs";
import * as React from "react";
import Alert from "~src/components/alert";
import ConfigKey from "~src/components/configKey";
import Note from "~src/components/note";
import PageGrid from "~src/components/pageGrid";
import PlatformContent from "~src/components/PlatformContent";
import PlatformIdentifier from "~src/components/platformIdentifier";
import PlatformLink from "~src/components/platformLink";
import PlatformSection from "~src/components/platformSection";
import SmartLink from "~src/components/smartLink";

const H2 = (props) => {
  return <h2>{props.children} </h2>;
};

const Code = (props) => {
  return <pre>{props.children} </pre>;
};

const Image = (props) => {
  let dimensions = {};
  let source = props.src;
  if (props.src.startsWith("/images")) {
    source = props.src.slice(0, props.src.indexOf("?"));
    dimensions = qs.parse(props.src.slice(props.src.indexOf("?") + 1));
  }
  console.log(dimensions);
  return (
    <a href={source} target="_blank" rel="noreferrer noopener">
      <NextImage {...props} src={source} {...dimensions} />
    </a>
  );
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
  img: Image,
};

export default components;
