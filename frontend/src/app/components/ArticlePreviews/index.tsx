interface ArticlePreviewProps {

}

export default function ArticlePreviews(props: ArticlePreviewProps) {
  return (
    <>
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
    </>
  );
}
