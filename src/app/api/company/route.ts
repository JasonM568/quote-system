import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  let company = await prisma.companyInfo.findUnique({ where: { id: "default" } });
  if (!company) {
    company = await prisma.companyInfo.create({ data: { id: "default" } });
  }
  return NextResponse.json(company);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const body = await req.json();
  const company = await prisma.companyInfo.upsert({
    where: { id: "default" },
    update: {
      name: body.name,
      address: body.address,
      phone: body.phone,
      email: body.email,
      taxId: body.taxId,
      logoUrl: body.logoUrl,
      stampUrl: body.stampUrl,
    },
    create: {
      id: "default",
      name: body.name,
      address: body.address || "",
      phone: body.phone || "",
      email: body.email || "",
      taxId: body.taxId || "",
      logoUrl: body.logoUrl || "",
      stampUrl: body.stampUrl || "",
    },
  });
  return NextResponse.json(company);
}
