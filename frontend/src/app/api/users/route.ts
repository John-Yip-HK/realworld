import { NextResponse } from "next/server";

import { extractResponseInfo } from "@/app/lib/handleResponse";

export async function POST(request: Request) {
  const newUser: User = await request.json();

  const signUpNewUserResponse = await fetch(`${process.env.API_PATH}/users`, {
    method: 'POST',
    body: JSON.stringify({ user: newUser, }),
    headers: {
      'Content-Type': 'application/json',
    }
  });

  const { responseBody, ...otherFields } = await extractResponseInfo(signUpNewUserResponse);

  return NextResponse.json(responseBody, {
    ...otherFields
  });
}