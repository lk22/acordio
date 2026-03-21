import {NextResponse, NextRequest} from "next/server";

import {prisma} from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const clients = await prisma.client.findMany();

    if ( ! clients ) {
      return NextResponse.json({
        message: "No clients found",
        success: false
      }, { status: 404 });
    }

    return NextResponse.json({
      message: `Found ${clients.length} clients`,
      clients,
    }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const {
    name,
    email,
    phone,
    address,
    company
  } = await request.json();

  const newClient = await prisma.client.create({
    data: {
      name,
      email,
      phone,
      address,
      company
    }
  });

  if ( ! newClient ) {
    return NextResponse.json({
      message: "Failed to create client",
      success: false
    }, { status: 500 });
  }

  return NextResponse.json({
    message: "Client created successfully",
    client: newClient,
    success: true
  });
}

export async function PUT(request: NextRequest) {
  const {
    id,
    name,
    email,
    phone,
    address,
    company,
    status,
    notes
  } = await request.json();

  const updatedClient = await prisma.client.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      address,
      company,
      status,
      notes
    }
  });

  if (!updatedClient) {
    return NextResponse.json({
      message: "Failed to update client",
      success: false
    }, { status: 500 });
  }

  return NextResponse.json({
    message: "Client updated successfully",
    client: updatedClient,
    success: true
  });
}

export async function PATCH(request: NextRequest) {
  const req = await request.json();
  const { id, status } = req;

  const updatedClient = await prisma.client.update({
    where: { id },
    data: { status }
  });

  if (!updatedClient) {
    return NextResponse.json({
      message: "Failed to update client status",
      success: false
    }, { status: 500 });
  }

  return NextResponse.json({
    message: "Client status updated successfully",
    client: updatedClient,
    success: true
  });
}