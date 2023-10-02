import path from 'node:path';
import { TAGS_PATH } from '../constants';
import { NextResponse } from 'next/server';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

export async function GET() {
  const getTagsResponse = await fetch(path.join(process.env.API_URL as string, TAGS_PATH));

  const { responseBody, status, statusText } = await extractResponseInfo(getTagsResponse);

  return NextResponse.json(responseBody, {
    status, statusText,
  });
}