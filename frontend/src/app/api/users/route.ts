import path from "node:path";
import { NextResponse } from "next/server";

import { extractResponseInfo } from "@/app/lib/handleResponse";
import { DEFAULT_HEADERS, USERS_PATH } from "../contants";

export async function POST(request: Request) {
  const newUser: User = await request.json();

  const signUpNewUserResponse = await fetch(path.join(process.env.API_URL as string, USERS_PATH), {
    method: 'POST',
    body: JSON.stringify({ user: newUser, }),
    headers: DEFAULT_HEADERS,
  });

  const { responseBody, ...otherFields } = await extractResponseInfo(signUpNewUserResponse);

  return NextResponse.json(responseBody, otherFields);
}