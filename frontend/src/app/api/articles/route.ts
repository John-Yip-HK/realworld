import { NextResponse } from 'next/server';

import { getApiPath } from '../utils';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { ARTICLES_PATH } from '../constants';

export async function GET() {
  const getArticlesResponse = await fetch(getApiPath(ARTICLES_PATH));

  const { responseBody, status, statusText } = await extractResponseInfo(getArticlesResponse);

  return NextResponse.json(responseBody, {
    status, statusText,
  });
}