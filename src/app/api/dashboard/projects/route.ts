import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      tasks: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!projects) {
    return NextResponse.json(
      {
        message: "No projects found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: `Found ${projects.length} projects`,
      projects,
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const { clientId, name, type, description } = await request.json();

  if (!clientId || !name) {
    return NextResponse.json(
      {
        message: "clientId and name are required",
        success: false,
      },
      { status: 400 }
    );
  }

  const newProject = await prisma.project.create({
    data: {
      clientId,
      name,
      type: type || "PROJECT",
      description,
    },
    include: {
      client: true,
    },
  });

  if (!newProject) {
    return NextResponse.json(
      {
        message: "Failed to create project",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Project created successfully",
      project: newProject,
      success: true,
    },
    { status: 201 }
  );
}

export async function PUT(request: NextRequest) {
  const { id, name, type, description } = await request.json();

  if (!id) {
    return NextResponse.json(
      {
        message: "Project id is required",
        success: false,
      },
      { status: 400 }
    );
  }

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      name,
      type,
      description,
    },
    include: {
      client: true,
      tasks: true,
    },
  });

  if (!updatedProject) {
    return NextResponse.json(
      {
        message: "Failed to update project",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Project updated successfully",
      project: updatedProject,
      success: true,
    },
    { status: 200 }
  );
}
