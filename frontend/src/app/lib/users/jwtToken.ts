'use client';

import { JWT_TOKEN } from "@/app/constants/user";

export function getJwtToken() {
  if (typeof window === 'undefined') return null;

  return localStorage.getItem(JWT_TOKEN);
}

export function hasJwtToken() {
  return getJwtToken() !== null;
}
