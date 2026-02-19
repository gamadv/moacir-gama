import { NextResponse } from 'next/server';

import { auth } from '@/shared/lib/auth/session';
import { prisma } from '@/shared/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      revenues: {
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      },
      contracts: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ data: company });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const existing = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json({ error: 'Empresa já cadastrada' }, { status: 409 });
  }

  const body = await request.json();
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  const company = await prisma.company.create({
    data: {
      name,
      userId: session.user.id,
    },
    include: {
      revenues: true,
      contracts: true,
    },
  });

  return NextResponse.json({ data: company }, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const body = await request.json();

  const data: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    data.name = name;
  }

  if (typeof body.dependents === 'number') {
    data.dependents = Math.max(0, Math.floor(body.dependents));
  }

  if (typeof body.proLabore === 'number') {
    data.proLabore = Math.max(0, Math.floor(body.proLabore));
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  const updated = await prisma.company.update({
    where: { id: company.id },
    data,
    include: {
      revenues: {
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      },
      contracts: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return NextResponse.json({ data: updated });
}
