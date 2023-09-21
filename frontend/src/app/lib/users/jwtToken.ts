'use client';

import { JWT_TOKEN } from "@/app/constants/user";

export function getJwtToken() {
  return localStorage.getItem(JWT_TOKEN);
}

export function hasJwtToken() {
  return getJwtToken() !== null;
}