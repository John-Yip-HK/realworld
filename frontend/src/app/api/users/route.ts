import { NextResponse } from "next/server";

import { extractResponseInfo } from "@/app/lib/api/handleResponse";

import { getApiPath } from "../utils";
import { createSetCookieHeader } from "./utils";

import { DEFAULT_HEADERS, USERS_PATH } from "../constants";

export async function POST(request: Request) {
  const newUser: User = await request.json();

  const signUpNewUserResponse = await fetch(getApiPath(USERS_PATH), {
    method: 'POST',
    body: JSON.stringify({ user: newUser, }),
    headers: DEFAULT_HEADERS,
  });

  const { responseBody, error, status, statusText } = await extractResponseInfo<SignUpUserResponse>(signUpNewUserResponse);

  if (!responseBody && error) {
    return NextResponse.json(error, {
      status, statusText
    });
  }

  const { token } = (responseBody as SignInUserSuccessResponse).user;

  return NextResponse.json(responseBody, {
    status,
    statusText,
    headers: {
      ...createSetCookieHeader(token),
    }
  });
}