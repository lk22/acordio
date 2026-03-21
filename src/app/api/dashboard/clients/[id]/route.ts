import {NextRequest, NextResponse} from "next/server";

import {prisma} from "@/lib/prisma";

export async function GET(request: NextRequest, {params}: {params: Promise<{ id: string }>}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id }
  });

  if ( ! client ) {
    return NextResponse.json({
      message: "Client not found",
      success: false
    }, { status: 404 });
  }

  return NextResponse.json({
    message: "Client found",
    client,
    success: true
  }, { status: 200 });
}