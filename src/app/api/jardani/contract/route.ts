import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth/session';
import { prisma } from '@/shared/lib/prisma';

async function getCompanyForUser(userId: string) {
  return prisma.company.findUnique({
    where: { userId },
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const company = await getCompanyForUser(session.user.id);
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const contracts = await prisma.pjContract.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ data: contracts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const company = await getCompanyForUser(session.user.id);
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const body = await request.json();
  const { valorHora, horasMes } = body;

  if (typeof valorHora !== 'number' || typeof horasMes !== 'number') {
    return NextResponse.json(
      { error: 'valorHora e horasMes são obrigatórios (números)' },
      { status: 400 }
    );
  }

  const contract = await prisma.pjContract.create({
    data: {
      companyId: company.id,
      valorHora: Math.max(0, Math.floor(valorHora)),
      horasMes: Math.max(0, Math.floor(horasMes)),
    },
  });

  return NextResponse.json({ data: contract }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const company = await getCompanyForUser(session.user.id);
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const body = await request.json();
  const { id, valorHora, horasMes } = body;

  if (!id) {
    return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });
  }

  const existing = await prisma.pjContract.findUnique({ where: { id } });
  if (!existing || existing.companyId !== company.id) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
  }

  const data: Record<string, unknown> = {};
  if (typeof valorHora === 'number') data.valorHora = Math.max(0, Math.floor(valorHora));
  if (typeof horasMes === 'number') data.horasMes = Math.max(0, Math.floor(horasMes));

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const updated = await prisma.pjContract.update({
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

  const company = await getCompanyForUser(session.user.id);
  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const contract = await prisma.pjContract.findUnique({ where: { id } });
  if (!contract || contract.companyId !== company.id) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
  }

  await prisma.pjContract.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true } });
}
