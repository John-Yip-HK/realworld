import { cookies } from "next/headers";

import { TOKEN_COOKIE_NAME } from "../constants/user";

export const hasAuthCookie = () => Boolean(getAuthToken());

export const getAuthToken = () => cookies().get(TOKEN_COOKIE_NAME)?.value;
