import { NextResponse } from 'next/server';

import { getApiPath, setAuthorizationHeader } from '../utils';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { ARTICLES_PATH, CLIENT_NEEDS_AUTH_HEADER_KEY } from '../constants';
import { getAuthToken } from '@/app/lib/authCookieUtils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasSearchParams = searchParams.size > 0;
  
  const fetchUrl = getApiPath(ARTICLES_PATH) + (hasSearchParams ? `?${searchParams.toString()}` : '');

  const { headers } = request;
  const clientNeedsAuth = headers.get(CLIENT_NEEDS_AUTH_HEADER_KEY);

  if (clientNeedsAuth) {
    const authToken = getAuthToken();
    setAuthorizationHeader(headers, authToken);
  }

  const getArticlesResponse = await fetch(fetchUrl, {
    headers,
  });

  const { responseBody, status, statusText } = await extractResponseInfo(getArticlesResponse);

  return NextResponse.json(responseBody, {
    status, statusText,
  });
}