import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const where = projectId ? { projectId } : {};

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        include: {
          client: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!tasks) {
    return NextResponse.json(
      {
        message: "No tasks found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: `Found ${tasks.length} tasks`,
      tasks,
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const { projectId, title, description, price, estimatedHours } =
    await request.json();

  if (!projectId || !title) {
    return NextResponse.json(
      {
        message: "projectId and title are required",
        success: false,
      },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return NextResponse.json(
      {
        message: "Project not found",
        success: false,
      },
      { status: 404 }
    );
  }

  const newTask = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      price: price ? parseFloat(price) : null,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
    },
    include: {
      project: true,
    },
  });

  if (!newTask) {
    return NextResponse.json(
      {
        message: "Failed to create task",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Task created successfully",
      task: newTask,
      success: true,
    },
    { status: 201 }
  );
}
