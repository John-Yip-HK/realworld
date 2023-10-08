import React from 'react'

interface ArticlePreviewProps {
  article: Article;
}

export default function ArticlePreview({
  article
}: ArticlePreviewProps) {
  const {
    slug,
    title,
    description,
    tagList,
    createdAt,
    favoritesCount,
    author: {
      username,
      image,
    }
  } = article;

  const profileLink = `/profile/${username.toLocaleLowerCase().replaceAll(' ', '-')}`;

  const articleLink = `/article/${slug}`;

  const localeDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tagPills = tagList.map(tag => (
    <li className="tag-default tag-pill tag-outline" key={tag}>
      {tag}
    </li>
  ));
  
  return (
    <div className="article-preview">
      <div className="article-meta">
        <a href={profileLink}><img src={image} /></a>
        <div className="info">
          <a href={profileLink} className="author">{username}</a>
          <span className="date">{localeDate}</span>
        </div>
        <button className="btn btn-outline-primary btn-sm pull-xs-right">{favoritesCount}
        </button>
      </div>
      <a href={articleLink} className="preview-link">
        <h1>{title}</h1>
        <p>{description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {tagPills}
        </ul>
      </a>
    </div>
  )
}