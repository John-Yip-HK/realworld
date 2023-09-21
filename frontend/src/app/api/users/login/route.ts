import path from "node:path";
import { NextResponse } from "next/server";

import { extractResponseInfo } from "@/app/lib/api/handleResponse";
import { DEFAULT_HEADERS, LOGIN_PATH, } from "../../constants";

export async function POST(request: Request) {
  const userCredentials: LogInCredentials = await request.json();

  const logInResponse = await fetch(path.join(process.env.API_URL as string, LOGIN_PATH), {
    method: 'POST',
    body: JSON.stringify({ user: userCredentials, }),
    headers: DEFAULT_HEADERS,
  });

  const { responseBody, status, statusText } = await extractResponseInfo<LogInUserResponse>(logInResponse);

  return NextResponse.json(responseBody, {
    status, statusText
  });
}