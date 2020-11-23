import fs from "fs-extra";
import matter from "gray-matter";
import hydrate from "next-mdx-remote/hydrate";
import renderToString from "next-mdx-remote/render-to-string";
import { useRouter } from "next/router";
import path from "path";
import * as React from "react";
import Alert from "~src/components/alert";
import Note from "~src/components/note";
import PageGrid from "~src/components/pageGrid";
import PlatformIdentifier from "~src/components/platformIdentifier";
import PlatformLink from "~src/components/platformLink";
import PlatformSection from "~src/components/platformSection";
import SmartLink from "~src/components/smartLink";
import PlatformContent from "../../components/PlatformContent";
import plugin from "../../plugins/mdxCompiler";

const root = process.cwd();
const components = {
  PlatformContent,
  Note,
  Alert,
  PlatformLink,
  A: SmartLink,
  PageGrid,
  PlatformIdentifier,
  PlatformSection,
};

export default function BlogPost({
  mdxSource,
  platform,
  guide,
  slug,
  frontMatter,
}) {
  const content = hydrate(mdxSource, { components });
  const router = useRouter();
  return (
    <>
      <h1>{frontMatter.title}</h1>
      <select
        value={router.query.slug[0]}
        onChange={(e) => router.push(`/platforms/${e.target.value}/`)}
      >
        <option>javascript</option>
        <option>node</option>
        <option>ruby</option>
        <option>java</option>
      </select>

      {content}
    </>
  );
}

export type Guide = {
  key: string;
  name: string;
  title: string;
  url: string;
  sdk: string;
  caseStyle: string;
  supportLevel: string;
  fallbackPlatform: string;
};

export type Platform = {
  key: string;
  name: string;
  title: string;
  url: string;
  sdk: string;
  caseStyle: string;
  supportLevel: string;
  guides?: Guide[];
  fallbackPlatform?: string;
};

const getPlatformFromParams = (params?: any) => {
  return params && params.slug ? params.slug[0] : "index";
};

const getGuideFromParams = (params?: any) => {
  return (
    params &&
    params.slug &&
    params.slug.length > 1 &&
    params.slug[1] === "guides" &&
    params.slug[2]
  );
};

const getPlatfromFromUrl = (url: string): string | null => {
  const match = url.match(/^([^\/]+)\//);
  return match ? match[1] : null;
};

const getGuideFromUrl = (url: string): string | null => {
  const match = url.match(/^[^\/]+\/guides\/([^\/]+)\//);
  return match ? match[1] : null;
};

const getMdxAtPath = (filepath: string) => {
  let source;
  const fileExists = fs.existsSync(filepath + ".mdx");
  const fileIndexExists = fs.existsSync(filepath + "/index.mdx");
  if (fileExists) {
    console.log("file exists");
    source = fs.readFileSync(filepath + ".mdx", "utf8");
  } else if (fileIndexExists) {
    console.log("index exists");
    source = fs.readFileSync(filepath + "/index.mdx", "utf8");
  } else {
    console.log(`file not found: ${filepath}`);
  }

  return source;
};

export async function getServerSideProps(ctx) {
  const { params, resolvedUrl, ...rest } = ctx;
  // console.log(ctx);

  console.log("params: ", params);
  console.log("path: ", params.slug.join("/"));
  const platform =
    getPlatfromFromUrl(resolvedUrl.replace("/platforms/", "")) ??
    params.slug[0];
  const guide = getGuideFromUrl(resolvedUrl.replace("/platforms/", ""));
  console.log("platform: ", platform);
  console.log("guide: ", guide);

  // /platforms/java/guides/log4j2/enriching-events/user-feedback -> java/common/enriching-events/user-feedback.mdx
  // /platforms/javascript/guides/react/components/errorboundary/ : javascript/guides/react/components/errorboundary.mdx
  //  javascript/guides/react/components -> javascript/guides/react/components/index.mdx
  const maybeEdge = path.resolve(
    path.join("src", "platforms", params.slug.join("/"))
  );
  // First we check the leaf
  let source = getMdxAtPath(maybeEdge);
  if (!source) {
    // Next check the shared platform-specific common folder, with same path
    const platformCommon = path.join(
      "src",
      "platforms",
      platform,
      "common",
      ...params.slug.slice(3)
    );
    source = getMdxAtPath(platformCommon);
    if (!source) {
      // Next check the shared common folder, with same path
      const sharedCommon = path.join(
        "src",
        "platforms",
        "common",
        ...params.slug.slice(3)
      );
      source = getMdxAtPath(sharedCommon);
    }
  }

  // Collect frontmatter and content (useful later?)
  const { data, content } = matter(source);

  // Call renderToString with dynamic resolution for <PlatformContent>
  const mdxSource = await renderToString(content, {
    components,
    mdxOptions: {
      remarkPlugins: [[plugin, { platform, frontmatter: data }]],
    },
  });

  return {
    props: {
      mdxSource,
      frontMatter: data,
      platform,
      guide,
      slug: params.slug,
    },
  };
}
