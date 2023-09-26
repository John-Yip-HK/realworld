import { extractResponseInfo } from "@/app/lib/api/handleResponse";
import { NextResponse } from "next/server";
import { USER_PATH } from "../constants";

export async function GET(request: Request) {
  const { headers } = request;

  const getUserResponse = await fetch(process.env.API_URL + USER_PATH, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${headers.get('Authorization')}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const { responseBody, ...otherFields } = await extractResponseInfo(getUserResponse);

  return NextResponse.json(responseBody, otherFields);
}