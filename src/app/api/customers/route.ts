import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const body = await req.json();
  const customer = await prisma.customer.create({
    data: {
      companyName: body.companyName,
      taxId: body.taxId || null,
      contactPerson: body.contactPerson,
      address: body.address || null,
      email: body.email,
      phone: body.phone || null,
    },
  });
  return NextResponse.json(customer);
}
