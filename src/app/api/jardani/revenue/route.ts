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

  const revenues = await prisma.monthlyRevenue.findMany({
    where: { companyId: company.id },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  return NextResponse.json({ data: revenues });
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
  const { year, month, revenue } = body;

  if (!year || !month || revenue == null) {
    return NextResponse.json({ error: 'year, month e revenue são obrigatórios' }, { status: 400 });
  }

  if (month < 1 || month > 12) {
    return NextResponse.json({ error: 'Mês deve ser entre 1 e 12' }, { status: 400 });
  }

  const entry = await prisma.monthlyRevenue.upsert({
    where: {
      companyId_year_month: {
        companyId: company.id,
        year,
        month,
      },
    },
    update: { revenue },
    create: {
      companyId: company.id,
      year,
      month,
      revenue,
    },
  });

  return NextResponse.json({ data: entry });
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
  const { revenues } = body;

  if (!Array.isArray(revenues) || revenues.length === 0) {
    return NextResponse.json({ error: 'revenues deve ser um array não vazio' }, { status: 400 });
  }

  const results = await prisma.$transaction(
    revenues.map((r: { year: number; month: number; revenue: number }) =>
      prisma.monthlyRevenue.upsert({
        where: {
          companyId_year_month: {
            companyId: company.id,
            year: r.year,
            month: r.month,
          },
        },
        update: { revenue: r.revenue },
        create: {
          companyId: company.id,
          year: r.year,
          month: r.month,
          revenue: r.revenue,
        },
      })
    )
  );

  return NextResponse.json({ data: results });
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

  const entry = await prisma.monthlyRevenue.findUnique({
    where: { id },
  });

  if (!entry || entry.companyId !== company.id) {
    return NextResponse.json({ error: 'Registro não encontrado' }, { status: 404 });
  }

  await prisma.monthlyRevenue.delete({ where: { id } });

  return NextResponse.json({ data: { deleted: true } });
}
