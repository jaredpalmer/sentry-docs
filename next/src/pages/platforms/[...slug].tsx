import fs from "fs-extra";
import matter, { read } from "gray-matter";
import yaml from "js-yaml";
import hydrate from "next-mdx-remote/hydrate";
import renderToString from "next-mdx-remote/render-to-string";
import { useRouter } from "next/router";
import path from "path";
import * as React from "react";
import addRouterEvents from "~src/components/addRouterEvents";
import components from "~src/components/markdownComponents";
import PlatformContext from "~src/components/platformContext";
import plugin from "../../plugins/mdxCompiler";

interface PlatformPageProps {
  mdxSource: string;
  slug?: string[];
  guide?: string;
  platforms: string[];
  frontmatter: any;
}
export default function PlatformPage({
  mdxSource,
  slug,
  platforms,
  guide,
  frontMatter,
}: PlatformPageProps) {
  const router = useRouter();
  React.useEffect(() => {
    const listeners = [];
    document
      .querySelectorAll(".docs-content .relative-link")
      .forEach((node) => {
        console.log(node);
        const href = node.getAttribute("href");
        // Exclude paths like #setup and hashes that have the same current path
        if (href && href[0] !== "#") {
          // Handle any relative path
          router.prefetch(href);

          listeners.push(addRouterEvents(node, router, { href }));
        }
      });
    return () => {
      listeners.forEach((cleanUpListener) => cleanUpListener());
    };
  }, [router]);

  const content = hydrate(mdxSource, {
    components: {
      ...components,
      wrapper: ({ children }) => (
        <PlatformContext.Provider value={{ platforms, guide, frontMatter }}>
          {children}
        </PlatformContext.Provider>
      ),
    },
  });
  return (
    <>
      <h1>{frontMatter.title}</h1>
      <a
        href={`https://docs.sentry.io${router.asPath}`}
        target="_blank"
        rel="noreferrer"
      >
        Compare to live docs
      </a>
      <select
        value={router.query.slug[0]}
        onChange={(e) =>
          router.push(
            `/platforms/${e.target.value}/${router.asPath.replace(
              `/platforms/${router.query.slug[0]}/`,
              ""
            )}`
          )
        }
      >
        <option>javascript</option>
        <option>node</option>
        <option>ruby</option>
        <option>java</option>
      </select>
      <div className="docs-content">
        <>{content}</>
      </div>
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

const getPlatfromFromUrl = (url: string): string | null => {
  const match = url.match(/^([^/]+)\//);
  return match ? match[1] : null;
};

const getGuideFromUrl = (url: string): string | null => {
  const match = url.match(/^[^/]+\/guides\/([^/]+)\//);
  return match ? match[1] : null;
};

const getMdxAtPath = (filepath: string) => {
  let source;
  const fileExists = fs.existsSync(filepath + ".mdx");
  const fileIndexExists = fs.existsSync(filepath + "/index.mdx");
  if (fileExists) {
    console.log("file exists: " + filepath + ".mdx");
    source = fs.readFileSync(filepath + ".mdx", "utf8");
  } else if (fileIndexExists) {
    console.log("file exists: " + filepath + "/index.mdx");
    source = fs.readFileSync(filepath + "/index.mdx", "utf8");
  } else {
    console.log(`file not found: ${filepath}.mdx`);
    console.log(`file not found: ${filepath}/index.mdx`);
  }

  return source;
};

const parseConfigFrontmatter = async (path: string) => {
  const { data: frontmatter } = read(path);
  console.log("configFrontmatter", frontmatter);
  return Object.fromEntries(
    Object.entries(frontmatter).filter(([key]) => frontmatterConfig.has(key))
  );
};

const frontmatterConfig = new Set([
  "title",
  "caseStyle",
  "supportLevel",
  "sdk",
  "fallbackPlatform",
  "categories",
  "aliases",
]);

const shareableConfig = new Set([
  "caseStyle",
  "supportLevel",
  "fallbackPlatform",
  "sdk",
  "categories",
]);

const DEFAULTS = {
  caseStyle: "canonical",
  supportLevel: "production",
};

type Config = {
  title?: string;
  caseStyle?: string;
  supportLevel?: string;
  sdk?: string;
  fallbackPlatform?: string;
  categories?: string[];
  aliases?: string[];
};

const parseConfig = async (path: string): Promise<Config> => {
  let config = {};
  try {
    config = await parseConfigFrontmatter(`${path}/index.mdx`);
  } catch (err) {
    // console.log(err);
  }

  try {
    const fp = fs.readFileSync(`${path}/config.yml`, "utf8");
    Object.assign(config, yaml.safeLoad(fp));
  } catch (err) {
    // console.log(err);
  }
  return config;
};
export async function getServerSideProps(ctx) {
  const { params, resolvedUrl, ...rest } = ctx;
  console.log("params: ", params);
  console.log("path: ", params.slug.join("/"));
  const platform =
    getPlatfromFromUrl(resolvedUrl.replace("/platforms/", "")) ??
    params.slug[0];
  const guide = getGuideFromUrl(resolvedUrl.replace("/platforms/", ""));
  const key = platform && guide ? `${platform}.${guide}` : platform;
  console.log("platform: ", platform);
  console.log("guide: ", guide);
  console.log("key: ", key);

  const rawPlatformConfig = await parseConfig(
    path.resolve(path.join("src", "platforms", platform))
  );
  console.log(rawPlatformConfig);

  let rawFallbackConfig = {};
  let shareableFallbackConfig = {};
  if (rawPlatformConfig.fallbackPlatform) {
    rawFallbackConfig = await parseConfig(
      path.resolve(
        path.join("src", "platforms", rawPlatformConfig.fallbackPlatform)
      )
    );
    shareableFallbackConfig = Object.fromEntries(
      Object.entries(rawPlatformConfig).filter(([key]) =>
        shareableConfig.has(key)
      )
    );
  }
  const shareablePlatformConfig = Object.fromEntries(
    Object.entries(rawPlatformConfig).filter(([key]) =>
      shareableConfig.has(key)
    )
  );
  let rawGuideConfig = {};
  let shareableGuideConfig = {};
  if (guide) {
    rawGuideConfig = await parseConfig(
      path.resolve(path.join("src", "platforms", platform, "guides", guide))
    );

    shareableGuideConfig = Object.fromEntries(
      Object.entries(rawGuideConfig).filter(([key]) => shareableConfig.has(key))
    );
  }

  const config = {
    ...rawFallbackConfig,
    ...rawPlatformConfig,
    ...rawGuideConfig,
  };

  const platforms = [
    guide && guide,
    platform && platform,
    rawPlatformConfig && rawPlatformConfig.fallbackPlatform,
  ].filter(Boolean);
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
      ...(guide ? params.slug.slice(3) : params.slug.slice(1))
    );
    source = getMdxAtPath(platformCommon);
    if (!source) {
      // Next check the shared common folder, with same path
      const sharedCommon = path.join(
        "src",
        "platforms",
        "common",
        ...(guide ? params.slug.slice(3) : params.slug.slice(1))
      );
      source = getMdxAtPath(sharedCommon);
    }
  }

  if (!source) {
    return { notFound: true };
  }

  // Collect frontmatter and content (useful later?)
  const { data, content } = matter(source);

  if (!content) {
    return { notFound: true };
  }

  // Call renderToString with dynamic resolution for <PlatformContent>
  const mdxSource = await renderToString(content, {
    components: {
      ...components,
      wrapper: ({ children }) => (
        <PlatformContext.Provider
          value={{
            frontMatter: data,
            platforms,
            guide,
          }}
        >
          {children}
        </PlatformContext.Provider>
      ),
    },
    mdxOptions: {
      remarkPlugins: [[plugin, { platform, platforms, frontmatter: data }]],
    },
  });

  return {
    props: {
      mdxSource,
      frontMatter: { ...config, ...data },
      platforms,
      guide,
      slug: params.slug,
    },
  };
}
