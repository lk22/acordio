import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const activityLog = await prisma.activityLog.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  if (!activityLog) {
    return NextResponse.json(
      {
        message: "Activity log not found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Activity log found",
      activityLog,
      success: true,
    },
    { status: 200 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { type, description } = await request.json();

  const updatedActivityLog = await prisma.activityLog.update({
    where: { id },
    data: {
      type,
      description,
    },
    include: {
      client: true,
    },
  });

  if (!updatedActivityLog) {
    return NextResponse.json(
      {
        message: "Failed to update activity log",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Activity log updated successfully",
      activityLog: updatedActivityLog,
      success: true,
    },
    { status: 200 }
  );
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deletedActivityLog = await prisma.activityLog.delete({
    where: { id },
  });

  if (!deletedActivityLog) {
    return NextResponse.json(
      {
        message: "Failed to delete activity log",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Activity log deleted successfully",
      success: true,
    },
    { status: 200 }
  );
}
