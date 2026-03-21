import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agreement = await prisma.agreement.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          client: true,
          tasks: true,
        },
      },
    },
  });

  if (!agreement) {
    return NextResponse.json(
      {
        message: "Agreement not found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Agreement found",
      agreement,
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
  const { content, type } = await request.json();

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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deletedAgreement = await prisma.agreement.delete({
    where: { id },
  });

  if (!deletedAgreement) {
    return NextResponse.json(
      {
        message: "Failed to delete agreement",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Agreement deleted successfully",
      success: true,
    },
    { status: 200 }
  );
}
