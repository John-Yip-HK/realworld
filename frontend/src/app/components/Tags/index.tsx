'use client';

import { getJsonFetch } from "@/app/lib/api/customFetch";
import { type ReactNode, useEffect, useState } from "react"

export default function Tags() {
  const [tagListContent, setTagListContent] = useState<ReactNode>('Loading Tags...');
  
  useEffect(() => {
    getJsonFetch('/api/tags', {
      loggedIn: false,
    })
      .then((getTagsResponse: GetTagsResponse) => {
        if ('tags' in getTagsResponse) {
          const { tags } = getTagsResponse;
          const tagsAnchors = tags.map((tag) => (
            <a href="/" className="tag-pill tag-default" key={tag}>{tag}</a>
          ));
          
          setTagListContent(tagsAnchors);
        }
      });
  }, []);
  
  return (
    <div className="sidebar">
      <p>Popular Tags</p>

      <div className="tag-list">
        {tagListContent}
      </div>
    </div>
  )
}
