import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const where = clientId ? { clientId } : {};

  const activityLogs = await prisma.activityLog.findMany({
    where,
    include: {
      client: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!activityLogs) {
    return NextResponse.json(
      {
        message: "No activity logs found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: `Found ${activityLogs.length} activity logs`,
      activityLogs,
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const { clientId, type, description } = await request.json();

  if (!clientId || !type || !description) {
    return NextResponse.json(
      {
        message: "clientId, type, and description are required",
        success: false,
      },
      { status: 400 }
    );
  }

  const newActivityLog = await prisma.activityLog.create({
    data: {
      clientId,
      type,
      description,
    },
    include: {
      client: true,
    },
  });

  if (!newActivityLog) {
    return NextResponse.json(
      {
        message: "Failed to create activity log",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Activity log created successfully",
      activityLog: newActivityLog,
      success: true,
    },
    { status: 201 }
  );
}
