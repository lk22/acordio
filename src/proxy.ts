import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import {SessionData, sessionOptions} from '@/lib/session';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const session = await getIronSession<SessionData>(request, response, {
    password: process.env.SESSION_SECRET as string,
    cookieName: "acordio_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    },
  });

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");

  if (!session.isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session.isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|imaage|icons|manifest.json|sw.js).*)"]
}