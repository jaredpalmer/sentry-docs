import * as React from "react";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import plugin from "../../plugins/mdxCompiler";
import { useRouter } from "next/router";
import dlv from "dlv";
const root = process.cwd();

import PlatformContent from "../../components/PlatformContent";
import Note from "~src/components/note";
import Alert from "~src/components/alert";
import PlatformLink from "~src/components/platformLink";
import PlatformIdentifier from "~src/components/platformIdentifier";
import PlatformRegistry from "~src/shared/platformRegistry";
import PageGrid from "~src/components/pageGrid";
import { getPlatformData } from "~src/manifest";

const components = {
  PlatformContent,
  Note,
  Alert,
  PlatformLink,
  PageGrid,
  PlatformIdentifier,
};

export default function BlogPost({ mdxSource, platform, slug, frontMatter }) {
  const content = hydrate(mdxSource, { components });
  const router = useRouter();
  return (
    <>
      <h1>{frontMatter.title}</h1>
      <select
        value={router.query.slug[0]}
        onChange={(e) =>
          router.push(
            `/docs/platforms/${e.target.value}/${router.query.slug[1]}`
          )
        }
      >
        <option>javascript</option>
        <option>node</option>
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
/**
 * Return the active platform or guide.

 * @param value platform key in format of `platformName[.guideName]`
 */
export const getPlatform = (
  key: string,
  platformList: any[]
): Platform | Guide | null => {
  if (!key) return;

  const [platformName, guideName] = key.split(".", 2);
  const activePlatform = platformList.find(
    (p: Platform) => p.key === platformName
  );
  const activeGuide =
    activePlatform &&
    (activePlatform as Platform).guides.find(
      (g: Guide) => g.name === guideName
    );

  return activeGuide ?? activePlatform ?? null;
};

export const getPlatformsWithFallback = (
  platform: Platform | Guide,
  platformList: any[]
): string[] => {
  const result = [platform.key];
  let curPlatform = platform;
  while (curPlatform.fallbackPlatform) {
    result.push(curPlatform.fallbackPlatform);
    curPlatform = getPlatform(curPlatform.fallbackPlatform, platformList);
  }
  return result;
};

export async function getServerSideProps(ctx) {
  const { params } = ctx;
  // console.log(ctx);
  console.log("params: ", params);
  console.log("path: ", params.slug.join("/"));
  const platform = getPlatformFromParams(params);
  const guide = getGuideFromParams(params);
  console.log("guide: ", guide);
  // console.log("platformData:", );
  const platformData = getPlatformData();
  const registry = new PlatformRegistry();
  await registry.init();
  const entry = getPlatform(
    `${platform}${guide && "." + guide}`,
    registry.platforms
  );
  const entryWithFalbback = getPlatformsWithFallback(entry, registry.platforms);
  console.log(entry);
  console.log(entryWithFalbback);
  // eventually getPathOrFallbackFromParams()
  // const source = fs.readFileSync(
  //   path.join(root, entry.path + `/index.mdx`),
  //   "utf8"
  // );
  const source = dlv(platformData, params.slug);

  // Collect frontmatter and content (useful later?)
  const { data, content } = matter(source);

  console.log("platform: ", params.slug[0]);

  // Call renderToString with dynamic resolution for <PlatformContent>
  const mdxSource = await renderToString(content, {
    components,
    mdxOptions: {
      remarkPlugins: [
        [plugin, { platform: params.slug[0], frontmatter: data }],
      ],
    },
  });

  return {
    props: {
      mdxSource,
      frontMatter: data,
      platform: params.slug[0],
      slug: params.slug,
    },
  };
}
