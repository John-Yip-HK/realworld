import MainPage from './components/MainPage';
import MainPageBanner from './components/MainPageBanner';

import Tags from './components/Tags';

export default function HomePage() {
  return (
    <main>
      <div className="home-page">
        <MainPageBanner />
        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <MainPage />
            </div>
            <div className="col-md-3">
              {/* <Tags /> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
