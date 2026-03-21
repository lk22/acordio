import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        include: {
          tasks: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!client) {
    return NextResponse.json(
      {
        message: "Client not found",
        success: false,
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      message: "Client found",
      client,
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
  const { name, email, phone, address, company, status, notes } =
    await request.json();

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      address,
      company,
      status,
      notes,
    },
  });

  if (!updatedClient) {
    return NextResponse.json(
      {
        message: "Failed to update client",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Client updated successfully",
      client: updatedClient,
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

  const deletedClient = await prisma.client.delete({
    where: { id },
  });

  if (!deletedClient) {
    return NextResponse.json(
      {
        message: "Failed to delete client",
        success: false,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Client deleted successfully",
      success: true,
    },
    { status: 200 }
  );
}
