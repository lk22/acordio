import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  const where = taskId ? { taskId } : {};

  const timeEntries = await prisma.timeEntry.findMany({
    where,
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
    orderBy: {
      date: "desc",
    },
  });

  if (!timeEntries || timeEntries.length === 0) {
    return NextResponse.json(
      {
        message: "No time entries found",
        success: false,
        timeEntries: [],
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      message: `Found ${timeEntries.length} time entries`,
      timeEntries,
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const { taskId, hours, date, notes } = await request.json();

  if (!taskId || hours === undefined || hours === null) {
    return NextResponse.json(
      {
        message: "taskId and hours are required",
        success: false,
      },
      { status: 400 }
    );
  }

  try {
    const newTimeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        hours: parseFloat(hours),
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
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

    return NextResponse.json(
      {
        message: "Time entry created successfully",
        timeEntry: newTimeEntry,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json(
      {
        message: "Failed to create time entry",
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { id, hours, date, notes } = await request.json();

  if (!id) {
    return NextResponse.json(
      {
        message: "Time entry id is required",
        success: false,
      },
      { status: 400 }
    );
  }

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
