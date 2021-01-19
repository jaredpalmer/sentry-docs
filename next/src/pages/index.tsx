import Link from "next/link";
import React from "react";

export const Home = (): JSX.Element => (
  <div>
    <ul>
      <li>
        <Link href="/platforms/android/usage/advanced-usage/">
          <a>/platforms/android/usage/advanced-usage/</a>
        </Link>
      </li>
      <li>
        <Link href="/platforms/javascript/enriching-events/attachments/">
          <a>/platforms/javascript/enriching-events/attachments/</a>
        </Link>
      </li>
      <li>
        <Link href="/platforms/apple/usage/">
          <a>/platforms/apple/usage/</a>
        </Link>
      </li>
    </ul>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
      }

      * {
        box-sizing: border-box;
      }
    `}</style>
  </div>
);

export default Home;
