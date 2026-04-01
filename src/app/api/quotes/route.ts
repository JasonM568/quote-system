import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const quotes = await prisma.quote.findMany({
    include: { customer: true, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const body = await req.json();

  // Generate quote number: QT-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.quote.count({
    where: {
      createdAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
    },
  });
  const quoteNumber = `QT-${dateStr}-${String(count + 1).padStart(3, "0")}`;

  // Calculate amounts using plain numbers
  let subtotal = 0;
  const itemsData = body.items.map((item: { serviceId?: string; name: string; specification?: string; unitPrice: number; quantity: number }) => {
    const amount = item.unitPrice * item.quantity;
    subtotal += amount;
    return {
      serviceId: item.serviceId || null,
      name: item.name,
      specification: item.specification || null,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      amount,
    };
  });

  const discountRate = (body.discount || 0) / 100;
  const discountedSubtotal = subtotal * (1 - discountRate);
  const taxRate = (body.taxRate ?? 5) / 100;
  const taxAmount = Math.round(discountedSubtotal * taxRate);
  const totalAmount = Math.round(discountedSubtotal + taxAmount);

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      customerId: body.customerId,
      userId: session.user.id,
      discount: body.discount || 0,
      taxRate: body.taxRate ?? 5,
      validUntil: new Date(body.validUntil),
      status: body.status || "draft",
      notes: body.notes || null,
      subtotal,
      taxAmount,
      totalAmount,
      items: { create: itemsData },
    },
    include: { items: true, customer: true },
  });

  return NextResponse.json(quote);
}
