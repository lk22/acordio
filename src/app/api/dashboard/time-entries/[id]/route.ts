import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const timeEntry = await prisma.timeEntry.findUnique({
    where: { id },
    include: {
      task: {
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      },
    },
  });

  if (!timeEntry) {
    return NextResponse.json(
      {
        message: "Time entry not found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Time entry found",
      timeEntry,
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
  const { hours, date, notes } = await request.json();

  const updatedTimeEntry = await prisma.timeEntry.update({
    where: { id },
    data: {
      hours,
      date,
      notes,
    },
    include: {
      task: {
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      },
    },
  });

  if (!updatedTimeEntry) {
    return NextResponse.json(
      {
        message: "Failed to update time entry",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Time entry updated successfully",
      timeEntry: updatedTimeEntry,
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

  const deletedTimeEntry = await prisma.timeEntry.delete({
    where: { id },
  });

  if (!deletedTimeEntry) {
    return NextResponse.json(
      {
        message: "Failed to delete time entry",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Time entry deleted successfully",
      success: true,
    },
    { status: 200 }
  );
}
