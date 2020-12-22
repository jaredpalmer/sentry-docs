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
import globby from "globby";
import PlatformSidebar from "~src/components/platformSidebar";
import BasePage from "~src/components/basePage";
import remarkAutolinkHeaders from "~src/plugins/remark-autolink-headers";
import remarkPluginCodetabs from "~src/plugins/remark-plugin-codetabs";

interface PlatformPageProps {
  mdxSource: string;
  slug?: string[];
  guide?: string;
  platform: string;
  platforms: string[];
  frontMatter: any;
  data: any;
}
export default function PlatformPage({
  mdxSource,
  platform,
  platforms,
  guide,
  data,
  frontMatter,
}: PlatformPageProps): JSX.Element {
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

          listeners.push(
            addRouterEvents(node, router, {
              href,
            })
          );
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
      <BasePage
        pageContext={{
          ...frontMatter,
          platform: { name: platform, title: platform },
          guide: { name: guide, title: guide },
        }}
        seoTitle={frontMatter.title}
        prependToc={null}
        sidebar={
          <PlatformSidebar
            data={data}
            platform={{ name: platform, title: platform }}
            guide={{ name: guide, title: guide }}
          />
        }
      >
        {content}
      </BasePage>
      {/* <h1>{frontMatter.title}</h1>
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
      <div style={{ display: "flex" }}>
        <PlatformSidebar
          data={data}
          platform={{ name: platform, title: platform }}
          guide={{ name: guide, title: guide }}
        />
        <div className="docs-content">
          <>{content}</>
        </div>
      </div> */}
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
  const fileExists = fs.existsSync(filepath);

  if (fileExists) {
    console.log("file exists: " + filepath);
    source = fs.readFileSync(filepath, "utf-8");
  } else {
    console.log(`file not found: ${filepath}`);
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

// const shareableConfig = new Set([
//   "caseStyle",
//   "supportLevel",
//   "fallbackPlatform",
//   "sdk",
//   "categories",
// ]);

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
  const { params, resolvedUrl } = ctx;
  console.log("params: ", params);
  console.log("path: ", params.slug.join("/"));
  // const resolvedUrl = "/platforms/" + params.slug.join("/");
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
  if (rawPlatformConfig.fallbackPlatform) {
    rawFallbackConfig = await parseConfig(
      path.resolve(
        path.join("src", "platforms", rawPlatformConfig.fallbackPlatform)
      )
    );
  }
  let rawGuideConfig = {};

  if (guide) {
    rawGuideConfig = await parseConfig(
      path.resolve(path.join("src", "platforms", platform, "guides", guide))
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

  console.log(platforms);

  const manifest = {};
  const parents = reverseArray(platforms);
  const commonPaths = await globby(`src/platforms/common/**/*.mdx`);
  const toPath = (str) =>
    str?.replace("src", "").replace(".mdx", "").replace("/index", "") + "/";

  for (const realPath of commonPaths) {
    const path = realPath.replace(
      "/common/",
      guide ? `/${platform}/guides/${guide}/` : `/${platform}/`
    );

    const {
      data: { title = null, sidebar_order = null, sidebar_title = null },
    } = read(realPath);
    manifest[toPath(path)] = {
      src: realPath,
      path: toPath(path),
      context: {
        platform: { name: platform },
        title,
        sidebar_order,
        sidebar_title,
      },
      isCommon: true,
      isGuide: true,
    };
  }

  for (const p of parents) {
    const platformPaths = await globby(`src/platforms/${p}/**/*.mdx`);
    console.log(p);
    for (const realPath of platformPaths) {
      let path;
      if (!realPath.includes("guides")) {
        path = realPath.replace(
          `/${p}/common/`,
          guide ? `/${platform}/guides/${guide}/` : `/${platform}/`
        );
        const {
          data: { title = null, sidebar_order = null, sidebar_title = null },
        } = read(realPath);
        manifest[toPath(path)] = {
          src: realPath,
          path: toPath(path),
          context: {
            platform: { name: platform },
            title,
            sidebar_order,
            sidebar_title,
          },
          isCommon: true,
          isGuide: true,
        };
      }
    }
  }

  // console.log(manifest);
  console.log("/platforms/" + params?.slug.join("/") + "/");
  const src = manifest["/platforms/" + params?.slug.join("/") + "/"];
  if (!src) {
    return { notFound: true };
  }
  const source = getMdxAtPath(src.src);
  if (!source) {
    return { notFound: true };
  }

  const { data, content } = matter(source);

  // Collect frontmatter and content (useful later?)

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
      remarkPlugins: [
        [plugin, { platform, platforms, frontmatter: data }],
        [remarkPluginCodetabs, { className: "code-tabs-wrapper" }],
        [remarkAutolinkHeaders, { className: "anchor" }],
      ],
    },
  });

  return {
    props: {
      mdxSource,
      frontMatter: { ...config, ...data },
      platforms,
      platform,
      data: Object.values(manifest).filter((n) => !!n.context),
      guide,
      slug: params.slug,
    },
  };
}

// export async function getStaticPaths() {
//   return {
//     paths: ["/platforms/android/"],
//     fallback: false, // See the "fallback" section below
//   };
// }

function reverseArray<T>(arr: T[]): T[] {
  const newArray = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    newArray.push(arr[i]);
  }
  return newArray;
}
