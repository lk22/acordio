import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
  });

  if (!task) {
    return NextResponse.json(
      {
        message: "Task not found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Task found",
      task,
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
  const { title, description, price, estimatedHours } = await request.json();

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
      estimatedHours:
        estimatedHours !== undefined
          ? estimatedHours
            ? parseFloat(estimatedHours)
            : null
          : undefined,
    },
    include: {
      project: true,
    },
  });

  if (!updatedTask) {
    return NextResponse.json(
      {
        message: "Failed to update task",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Task updated successfully",
      task: updatedTask,
      success: true,
    },
    { status: 200 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deletedTask = await prisma.task.delete({
    where: { id },
  });

  if (!deletedTask) {
    return NextResponse.json(
      {
        message: "Failed to delete task",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Task deleted successfully",
      success: true,
    },
    { status: 200 }
  );
}
