'use client';

import { type MouseEventHandler, useState } from "react";
import { hasJwtToken } from "./lib/users/jwtToken";
import { clsx } from "clsx";
import MainPageBanner from "./components/MainPageBanner";

const tabs = [
  {
    linkName: 'your-feed',
    label: 'Your Feed',
  },
  {
    linkName: 'global-feed',
    label: 'Global Feed',
  },
];

export default function HomePage() {
  const hasAuthToken = hasJwtToken();
  const [selectedTab, setSelectedTab] = useState(tabs[hasAuthToken ? 0 : 1].linkName);

  const navLinkCls = (linkName: string) => clsx('nav-link', {
    active: selectedTab === linkName,
  });

  const onTabChange = (linkName: string): MouseEventHandler<HTMLAnchorElement> => (event) => {
    event.preventDefault();

    setSelectedTab(linkName);
  };

  return (
    <main>
      <div className="home-page">
        <MainPageBanner hasAuthToken={hasAuthToken} />

        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">
                  {/* {
                    tabs
                      .filter((tab) => hasAuthToken || tab.linkName !== 'your-feed')
                      .map(({ linkName, label }) => (
                        <li className="nav-item" key={linkName}>
                          <a className={navLinkCls(linkName)} onClick={onTabChange(linkName)}>{label}</a>
                        </li>
                      ))
                  } */}
                </ul>
              </div>

              <div className="article-preview">
                <div className="article-meta">
                  <a href="/profile/eric-simons"><img src="http://i.imgur.com/Qr71crq.jpg" /></a>
                  <div className="info">
                    <a href="/profile/eric-simons" className="author">Eric Simons</a>
                    <span className="date">January 20th</span>
                  </div>
                  <button className="btn btn-outline-primary btn-sm pull-xs-right">
                    <i className="ion-heart"></i> 29
                  </button>
                </div>
                <a href="/article/how-to-build-webapps-that-scale" className="preview-link">
                  <h1>How to build webapps that scale</h1>
                  <p>This is the description for the post.</p>
                  <span>Read more...</span>
                  <ul className="tag-list">
                    <li className="tag-default tag-pill tag-outline">realworld</li>
                    <li className="tag-default tag-pill tag-outline">implementations</li>
                  </ul>
                </a>
              </div>

              <div className="article-preview">
                <div className="article-meta">
                  <a href="/profile/albert-pai"><img src="http://i.imgur.com/N4VcUeJ.jpg" /></a>
                  <div className="info">
                    <a href="/profile/albert-pai" className="author">Albert Pai</a>
                    <span className="date">January 20th</span>
                  </div>
                  <button className="btn btn-outline-primary btn-sm pull-xs-right">
                    <i className="ion-heart"></i> 32
                  </button>
                </div>
                <a href="/article/the-song-you" className="preview-link">
                  <h1>The song you won&apos;t ever stop singing. No matter how hard you try.</h1>
                  <p>This is the description for the post.</p>
                  <span>Read more...</span>
                  <ul className="tag-list">
                    <li className="tag-default tag-pill tag-outline">realworld</li>
                    <li className="tag-default tag-pill tag-outline">implementations</li>
                  </ul>
                </a>
              </div>

              <ul className="pagination">
                <li className="page-item active">
                  <a className="page-link" href="/">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="/">2</a>
                </li>
              </ul>
            </div>

            <div className="col-md-3">
              <div className="sidebar">
                <p>Popular Tags</p>

                <div className="tag-list">
                  <a href="/" className="tag-pill tag-default">programming</a>
                  <a href="/" className="tag-pill tag-default">javascript</a>
                  <a href="/" className="tag-pill tag-default">emberjs</a>
                  <a href="/" className="tag-pill tag-default">angularjs</a>
                  <a href="/" className="tag-pill tag-default">react</a>
                  <a href="/" className="tag-pill tag-default">mean</a>
                  <a href="/" className="tag-pill tag-default">node</a>
                  <a href="/" className="tag-pill tag-default">rails</a>
                </div>
              </div>
            </div>
          </div>
        Main</div>
      </div>
    </main>
  )
}
