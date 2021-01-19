// import NextImage from "next/image";
// import qs from "query-string";
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
import CodeBlock, { CodeWrapper } from "~src/components/codeBlock";
import CodeTabs from "~src/components/codeTabs";

const H2 = (props) => {
  return <h2>{props.children} </h2>;
};

// const Image = (props) => {
//   let dimensions = {};
//   let source = props.src;
//   if (props.src.startsWith("/images")) {
//     source = props.src.slice(0, props.src.indexOf("?"));
//     dimensions = qs.parse(props.src.slice(props.src.indexOf("?") + 1));
//   }
//   console.log(dimensions);
//   return (
//     <a href={source} target="_blank" rel="noreferrer noopener">
//       <NextImage {...props} src={source} {...dimensions} />
//     </a>
//   );
// };

const components = {
  PlatformContent,
  Note,
  Alert,
  h2: H2,
  // pre: (p) => <>{p.children}</>,
  CodeWrapper,
  PlatformLink,
  a: SmartLink,
  PageGrid,
  PlatformIdentifier,
  PlatformSection,
  ConfigKey,
  CodeBlock,
  // code: CodeBlock,
  CodeTabs,
  // img: Image,
};

export default components;
