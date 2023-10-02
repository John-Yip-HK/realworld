
import ArticlePagination from "./components/ArticlePagination";
import ArticlePreviews from "./components/ArticlePreviews";
import MainPageBanner from "./components/MainPageBanner";
import MainPageTabs from "./components/MainPageTabs";

import Tags from "./components/Tags";

export default function HomePage() {
  return (
    <main>
      <div className="home-page">
        <MainPageBanner />
        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <MainPageTabs />
              <ArticlePreviews />
              <ArticlePagination />
            </div>
            <div className="col-md-3">
              <Tags />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
