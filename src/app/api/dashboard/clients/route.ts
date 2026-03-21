import {NextResponse, NextRequest} from "next/server";

import {prisma} from "@/lib/prisma";

function fetchSingleClient(id: string) {
  return prisma.client.findUnique({
    where: { id }
  });
}

function fetchAllClients() {
  return prisma.client.findMany();
}

export async function GET(request: NextRequest) {
  if ( request.nextUrl.searchParams.get("id") ) {
    const id = request.nextUrl.searchParams.get("id") as string;
    const client = await fetchSingleClient(id);

    if ( ! client ) {
      return NextResponse.json({
        message: "Client not found",
        success: false
      });
    }

    return NextResponse.json({
      message: "Client found",
      client,
      success: true
    });
  } else {
    const clients = await fetchAllClients();

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