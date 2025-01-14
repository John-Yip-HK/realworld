import { NextResponse } from 'next/server';

import { getApiPath, setAuthorizationHeader } from '../../utils';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { ARTICLES_FEED_PATH } from '../../constants';
import { getAuthToken } from '@/app/lib/authCookieUtils';

export async function GET(request: Request) {
  const { headers, url } = request;
  const { searchParams } = new URL(url);
  const hasSearchParams = searchParams.size > 0;

  const fetchUrl = getApiPath(ARTICLES_FEED_PATH) + (hasSearchParams ? `?${searchParams.toString()}` : '');

  const authToken = getAuthToken();
  setAuthorizationHeader(headers, authToken);

  const getArticlesResponse = await fetch(fetchUrl, {
    headers,
  });

  const { responseBody, status, statusText } = await extractResponseInfo(getArticlesResponse);

  return NextResponse.json(responseBody, {
    status, statusText,
  });
}