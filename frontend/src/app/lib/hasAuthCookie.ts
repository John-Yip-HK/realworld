import { cookies } from "next/headers";

import { TOKEN_COOKIE_NAME } from "../constants/user";

export const hasAuthCookie = () =>  cookies().has(TOKEN_COOKIE_NAME);