import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const service = await prisma.service.update({
    where: { id },
    data: {
      name: body.name,
      specification: body.specification || null,
      unitPrice: body.unitPrice,
      description: body.description || null,
    },
  });
  return NextResponse.json(service);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const { id } = await params;
  await prisma.service.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
