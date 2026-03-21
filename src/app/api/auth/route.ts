import {NextRequest, NextResponse} from "next/server";
import {getSession} from "@/lib/session";

export async function GET() {
  return NextResponse.json({
    "ok": true
  });
}

export async function POST(request: NextRequest) {
  const {username, password} = await request.json();

  const validUsername = username === process.env.APP_USERNAME;
  const validPassword = password === process.env.APP_PASSWORD;

  if (!validUsername || !validPassword) {
    return NextResponse.json({
      message: "Forkert brugernavn eller adgangskode",
    }, {
      status: 401,
    })
  }

  const session = await getSession();
  session.isLoggedIn = true;
  session.username = username;
  await session.save();

  return NextResponse.json({
    ok: true
  });
}

export async function DELETE() {
  const session = await getSession();
  await session.destroy();
  return NextResponse.json({
    ok: true
  })
}