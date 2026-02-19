import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth/session';
import { prisma } from '@/shared/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const assets = await prisma.financialAsset.findMany({
    where: { userId: session.user.id },
    orderBy: [{ category: 'asc' }, { institution: 'asc' }],
  });

  return NextResponse.json({ data: assets });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const {
    category,
    institution,
    assetType,
    valueBrl,
    valueForeign,
    foreignCurrency,
    yieldRate,
    notes,
  } = body;

  if (!category || !institution || !assetType || typeof valueBrl !== 'number') {
    return NextResponse.json(
      { error: 'category, institution, assetType e valueBrl são obrigatórios' },
      { status: 400 }
    );
  }

  if (category !== 'renda_variavel' && category !== 'renda_fixa') {
    return NextResponse.json(
      { error: 'category deve ser "renda_variavel" ou "renda_fixa"' },
      { status: 400 }
    );
  }

  const asset = await prisma.financialAsset.create({
    data: {
      userId: session.user.id,
      category,
      institution: institution.trim(),
      assetType: assetType.trim(),
      valueBrl: Math.max(0, Math.floor(valueBrl)),
      valueForeign: typeof valueForeign === 'number' ? Math.max(0, Math.floor(valueForeign)) : null,
      foreignCurrency: foreignCurrency?.trim() || null,
      yieldRate: yieldRate?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ data: asset }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  const existing = await prisma.financialAsset.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Ativo não encontrado' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (fields.category === 'renda_variavel' || fields.category === 'renda_fixa') {
    data.category = fields.category;
  }
  if (typeof fields.institution === 'string' && fields.institution.trim()) {
    data.institution = fields.institution.trim();
  }
  if (typeof fields.assetType === 'string' && fields.assetType.trim()) {
    data.assetType = fields.assetType.trim();
  }
  if (typeof fields.valueBrl === 'number') {
    data.valueBrl = Math.max(0, Math.floor(fields.valueBrl));
  }
  if (fields.valueForeign === null) {
    data.valueForeign = null;
  } else if (typeof fields.valueForeign === 'number') {
    data.valueForeign = Math.max(0, Math.floor(fields.valueForeign));
  }
  if (fields.foreignCurrency !== undefined) {
    data.foreignCurrency = fields.foreignCurrency?.trim() || null;
  }
  if (fields.yieldRate !== undefined) {
    data.yieldRate = fields.yieldRate?.trim() || null;
  }
  if (fields.notes !== undefined) {
    data.notes = fields.notes?.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const updated = await prisma.financialAsset.update({
    where: { id },
    data,
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  const asset = await prisma.financialAsset.findUnique({ where: { id } });
  if (!asset || asset.userId !== session.user.id) {
    return NextResponse.json({ error: 'Ativo não encontrado' }, { status: 404 });
  }

  await prisma.financialAsset.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true } });
}
