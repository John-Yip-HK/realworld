import { NextResponse } from 'next/server';

import { getApiPath } from '../utils';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { ARTICLES_PATH } from '../constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasSearchParams = searchParams.size > 0;
  
  const fetchUrl = getApiPath(ARTICLES_PATH) + (hasSearchParams ? `?${searchParams.toString()}` : '');

  const getArticlesResponse = await fetch(fetchUrl);

  const { responseBody, status, statusText } = await extractResponseInfo(getArticlesResponse);

  return NextResponse.json(responseBody, {
    status, statusText,
  });
}