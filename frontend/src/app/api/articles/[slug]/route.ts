
import { NextResponse } from 'next/server';

import { getAuthToken } from '@/app/lib/authCookieUtils';
import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { getApiPath, setAuthorizationHeader } from '../../utils';

import { 
  ARTICLES_PATH, 
  UNAUTHORIZED_ERROR,
  UNAITHORIZED_ERROR_STATUS_CODE,
} from '../../constants';

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const { headers } = request;
  const { slug } = params;
  const hasAuthToken = getAuthToken();

  if (!hasAuthToken) {
    return NextResponse.json(UNAUTHORIZED_ERROR, {
      status: UNAITHORIZED_ERROR_STATUS_CODE,
    })
  }

  const deleteUrl = getApiPath(ARTICLES_PATH, slug);
  setAuthorizationHeader(headers, hasAuthToken);

  const deleteArticleResponse = await fetch(deleteUrl, { 
    method: 'DELETE',
    headers, 
  });

  const { responseBody, status, statusText } = await extractResponseInfo<DeleteArticleResponse>(deleteArticleResponse);

  if (responseBody !== undefined) {
    // Has error.
    return NextResponse.json(responseBody, {
      status, statusText,
    });
  } else {
    return new Response(undefined, {
      status,
    });
  }
}
