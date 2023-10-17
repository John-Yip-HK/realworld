import { NextResponse } from 'next/server';

import { extractResponseInfo } from '@/app/lib/api/handleResponse';

import { getApiPath } from '../../utils';

import { DEFAULT_HEADERS, LOGIN_PATH, } from '../../constants';
import { createAuthHeader, createSetCookieHeader } from '../utils';

export async function POST(request: Request) {
  const userCredentials: LogInCredentials = await request.json();

  console.log(createAuthHeader());

  const logInResponse = await fetch(getApiPath(LOGIN_PATH), {
    method: 'POST',
    body: JSON.stringify({ user: userCredentials, }),
    headers: DEFAULT_HEADERS,
  });

  const { responseBody, error, status, statusText } = await extractResponseInfo<LogInUserResponse>(logInResponse);

  if (!responseBody && error) {
    return NextResponse.json(error, {
      status, statusText
    });
  }

  const { token } = (responseBody as LogInUserSuccessResponse).user;

  return NextResponse.json(responseBody, {
    status,
    statusText,
    headers: {
      ...createSetCookieHeader(token),
    }
  });
}