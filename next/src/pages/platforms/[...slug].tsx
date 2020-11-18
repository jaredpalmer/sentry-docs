import * as React from "react";
import renderToString from "next-mdx-remote/render-to-string";
import hydrate from "next-mdx-remote/hydrate";
import matter from "gray-matter";
import fs from "fs";
import path from "path";
import plugin from "../../plugins/mdxCompiler";
import { useRouter } from "next/router";

const root = process.cwd();

import PlatformContent from "../../components/PlatformContent";
import Note from "~src/components/note";
import PlatformLink from "~src/components/platformLink";
import PlatformRegistry from "~src/shared/platformRegistry";
import PageGrid from "~src/components/pageGrid";

const components = { PlatformContent, Note, PlatformLink, PageGrid };

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

export async function getServerSideProps(ctx) {
  const { params } = ctx;
  // console.log(ctx);
  console.log("params: ", params);
  console.log("path: ", params.slug.join("/"));
  const platform = getPlatformFromParams(params);
  const guide = getGuideFromParams(params);
  console.log("guide: ", guide);
  const registry = new PlatformRegistry();
  await registry.init();
  const entry = registry.get(`${platform}${guide && "." + guide}`);
  console.log(entry);
  // eventually getPathOrFallbackFromParams()
  const source = fs.readFileSync(
    path.join(root, entry.path + `/index.mdx`),
    "utf8"
  );

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
