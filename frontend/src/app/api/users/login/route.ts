import path from "node:path";
import { NextResponse } from "next/server";

import { extractResponseInfo } from "@/app/lib/handleResponse";
import { DEFAULT_HEADERS, USERS_PATH } from "../../contants";

export async function POST(request: Request) {
  const userCredentials: SignInCredentials = await request.json();

  // const signInResponse = await fetch(path.join(process.env.API_URL as string, USERS_PATH, 'login'), {
  //   method: 'POST',
  //   body: JSON.stringify({ user: userCredentials, }),
  //   headers: DEFAULT_HEADERS,
  // });

  // const { responseBody, ...otherFields } = await extractResponseInfo(signInResponse);

  // return NextResponse.json({
  //   user: userCredentials,
  // }, otherFields);

  return NextResponse.json({ user: userCredentials, });
}