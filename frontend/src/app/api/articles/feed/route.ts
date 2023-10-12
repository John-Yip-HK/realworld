import { NextResponse } from 'next/server';

import { getApiPath } from '../../utils';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { ARTICLES_FEED_PATH } from '../../constants';

export async function GET(request: Request) {
  const { headers, url } = request;
  const { searchParams } = new URL(url);
  const hasSearchParams = searchParams.size > 0;
  
  const fetchUrl = getApiPath(ARTICLES_FEED_PATH) + (hasSearchParams ? `?${searchParams.toString()}` : '');

  // TODO: Remove `host` header from all requests.
  headers.delete('host');

  const getArticlesResponse = await fetch(fetchUrl, {
    headers,
  });

  const { responseBody, status, statusText } = await extractResponseInfo(getArticlesResponse);

  return NextResponse.json(responseBody, {
    status, statusText,
  });
}