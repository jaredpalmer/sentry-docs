import styled from "@emotion/styled";
import React from "react";
import SmartLink from "./smartLink";

type Props = {
  includePath: string;
  platform?: string;
  children?: React.ReactNode;
  fallbackPlatform?: string;
  notateUnsupported?: boolean;
};

const MissingContent = styled.div`
  font-style: italic;
  background: var(--lightest-purple-background);
  border: 1px dashed #ccc;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;

  p:last-child {
    margin-bottom: 0;
  }
`;

export default function PlatformContent({
  platform,
  children,
  notateUnsupported = true,
}: Props): JSX.Element {
  const [dropdown, setDropdown] = React.useState(null);
  // const [currentPlatform, setPlatform, isFixed] = usePlatform(platform);
  // const hasDropdown = !isFixed;
  const hasDropdown = false;
  // const matches = [{ name: platform, key: platform }];
  return (
    <section className="platform-specific-content">
      {hasDropdown && (
        <div className="nav pb-1 flex">
          <div className="dropdown mr-2 mb-1">
            <button
              className="btn btn-sm btn-secondary dropdown-toggle"
              onClick={() => setDropdown(!dropdown)}
            >
              {platform}
            </button>

            <div
              className="nav dropdown-menu"
              role="tablist"
              style={{ display: dropdown ? "block" : "none" }}
            >
              <a
                className="dropdown-item"
                role="tab"
                style={{ cursor: "pointer" }}
              >
                Swift
              </a>
              <a
                className="dropdown-item"
                role="tab"
                style={{ cursor: "pointer" }}
              >
                Objective-C
              </a>
              <SmartLink className="dropdown-item" to="/platforms/">
                <em>Platform not listed?</em>
              </SmartLink>
            </div>
          </div>
        </div>
      )}

      <div className="tab-content">
        <div className="tab-pane show active">
          {children ? (
            <React.Fragment>
              {children || null}
              {/* <Content key={contentMatch.id} file={contentMatch} /> */}
            </React.Fragment>
          ) : (
            notateUnsupported && (
              <MissingContent>
                <p>
                  The platform or SDK you&apos;ve selected either does not
                  support this functionality, or it is missing from
                  documentation.
                </p>
                <p>
                  If you think this is an error, feel free to{" "}
                  <SmartLink to="https://github.com/getsentry/sentry-docs/issues/new">
                    let us know on GitHub
                  </SmartLink>
                  .
                </p>
              </MissingContent>
            )
          )}
        </div>
      </div>
    </section>
  );
}
