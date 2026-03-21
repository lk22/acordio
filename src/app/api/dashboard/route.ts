import {NextResponse, NextRequest} from "next/server";

export async function GET(_request: NextRequest) {
  return NextResponse.json({
    message: "Hello from the dashboard API!"
  })
}