import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const where = projectId ? { projectId } : {};

  const agreements = await prisma.agreement.findMany({
    where,
    include: {
      project: {
        include: {
          client: true,
          tasks: true,
        },
      },
    },
    orderBy: {
      generatedAt: "desc",
    },
  });

  if (!agreements) {
    return NextResponse.json(
      {
        message: "No agreements found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: `Found ${agreements.length} agreements`,
      agreements,
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const { projectId, type, content } = await request.json();

  if (!projectId || !content) {
    return NextResponse.json(
      {
        message: "projectId and content are required",
        success: false,
      },
      { status: 400 }
    );
  }

  const newAgreement = await prisma.agreement.create({
    data: {
      projectId,
      type: type || "PROJECT",
      content,
    },
    include: {
      project: {
        include: {
          client: true,
          tasks: true,
        },
      },
    },
  });

  if (!newAgreement) {
    return NextResponse.json(
      {
        message: "Failed to create agreement",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Agreement created successfully",
      agreement: newAgreement,
      success: true,
    },
    { status: 201 }
  );
}

export async function PUT(request: NextRequest) {
  const { id, content, type } = await request.json();

  if (!id) {
    return NextResponse.json(
      {
        message: "Agreement id is required",
        success: false,
      },
      { status: 400 }
    );
  }

  const updatedAgreement = await prisma.agreement.update({
    where: { id },
    data: {
      content,
      type,
    },
    include: {
      project: {
        include: {
          client: true,
          tasks: true,
        },
      },
    },
  });

  if (!updatedAgreement) {
    return NextResponse.json(
      {
        message: "Failed to update agreement",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Agreement updated successfully",
      agreement: updatedAgreement,
      success: true,
    },
    { status: 200 }
  );
}
