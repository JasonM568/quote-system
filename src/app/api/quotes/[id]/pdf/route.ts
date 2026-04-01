import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotePDF } from "@/components/QuotePDF";
import React from "react";
import path from "path";
import { readFile } from "fs/promises";

async function imageToBase64(urlOrPath: string): Promise<string | null> {
  try {
    if (urlOrPath.startsWith("http")) {
      const res = await fetch(urlOrPath);
      const buffer = await res.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const contentType = res.headers.get("content-type") || "image/png";
      return `data:${contentType};base64,${base64}`;
    } else {
      const filePath = path.join(process.cwd(), "public", urlOrPath);
      const buffer = await readFile(filePath);
      const ext = path.extname(urlOrPath).slice(1) || "png";
      const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "未授權" }, { status: 401 });

  const { id } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
      user: { select: { name: true } },
    },
  });

  if (!quote) return NextResponse.json({ error: "找不到報價單" }, { status: 404 });

  let company = await prisma.companyInfo.findUnique({ where: { id: "default" } });
  if (!company) {
    company = await prisma.companyInfo.create({ data: { id: "default" } });
  }

  const logoBase64 = company.logoUrl ? await imageToBase64(company.logoUrl) : null;
  const stampBase64 = company.stampUrl ? await imageToBase64(company.stampUrl) : null;

  const element = React.createElement(QuotePDF, {
    quote: {
      quoteNumber: quote.quoteNumber,
      createdAt: quote.createdAt.toISOString(),
      validUntil: quote.validUntil.toISOString(),
      discount: quote.discount.toString(),
      taxRate: quote.taxRate.toString(),
      subtotal: quote.subtotal.toString(),
      taxAmount: quote.taxAmount.toString(),
      totalAmount: quote.totalAmount.toString(),
      notes: quote.notes,
      status: quote.status,
    },
    customer: {
      companyName: quote.customer.companyName,
      taxId: quote.customer.taxId,
      contactPerson: quote.customer.contactPerson,
      address: quote.customer.address,
      email: quote.customer.email,
      phone: quote.customer.phone,
    },
    company: {
      name: company.name,
      address: company.address,
      phone: company.phone,
      email: company.email,
      taxId: company.taxId,
    },
    items: quote.items.map((item) => ({
      name: item.name,
      specification: item.specification,
      unitPrice: item.unitPrice.toString(),
      quantity: item.quantity,
      amount: item.amount.toString(),
    })),
    userName: quote.user.name,
    logoBase64,
    stampBase64,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${quote.quoteNumber}.pdf"`,
    },
  });
}
