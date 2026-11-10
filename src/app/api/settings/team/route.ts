import { NextResponse } from 'next/server';

let teamState = [
  {
    id: 'usr_1',
    name: 'Gustavo Oliveira',
    email: 'gustavo@pilotcrm.com.br',
    role: 'admin',
  },
  {
    id: 'usr_2',
    name: 'Mariana Costa',
    email: 'mariana@pilotcrm.com.br',
    role: 'reviewer',
  },
];

export async function GET() {
  return NextResponse.json({ members: teamState });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (Array.isArray(body?.members)) {
    teamState = body.members;
  }
  return NextResponse.json({ members: teamState });
}
