import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  username?: string;
  password?: string;
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), {
    password: process.env.SESSION_SECRET as string,
    cookieName: "acordio_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    },
  });
}