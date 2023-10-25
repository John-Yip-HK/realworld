import { NextResponse } from "next/server";

import { extractResponseInfo } from "@/app/lib/api/handleResponse";

import { USER_PATH } from "@/app/constants/user";

export async function GET(request: Request) {
  const { headers } = request;
  const authToken = headers.get('authorization') || '';

  const getUserResponse = await fetch(process.env.API_URL + USER_PATH, {
    headers: {
      'Authorization': authToken,
    },
  });

  const { responseBody, status, statusText } = await extractResponseInfo(getUserResponse);

  return NextResponse.json(responseBody, {
    status,
    statusText,
  });
}