import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const newUser: User = await request.json();

  const signUpNewUserResponse = await fetch('https://api.realworld.io/api/users', {
    method: 'POST',
    body: JSON.stringify(newUser),
  });

  return NextResponse.json(signUpNewUserResponse);
}