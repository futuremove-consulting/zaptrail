import { NextResponse } from 'next/server';
import {
  getWorkspaceMembers,
  setWorkspaceMembers,
} from '@/lib/server-storage';

export async function GET() {
  return NextResponse.json({ members: getWorkspaceMembers() });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  if (Array.isArray(body?.members)) {
    setWorkspaceMembers(body.members);
  }
  return NextResponse.json({ members: getWorkspaceMembers() });
}
