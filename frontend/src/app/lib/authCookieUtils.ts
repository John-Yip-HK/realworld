import { cookies } from "next/headers";

import { TOKEN_COOKIE_NAME } from "../constants/user";

export const hasAuthCookie = () => Boolean(cookies().get(TOKEN_COOKIE_NAME)?.value);

export const getAuthToken = () => cookies().get(TOKEN_COOKIE_NAME)?.value;

