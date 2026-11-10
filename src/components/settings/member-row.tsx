'use client';

import { Select } from '@/components/ui/select';

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'reviewer' | 'viewer';
}

interface MemberRowProps {
  member: WorkspaceMember;
  onRoleChange: (id: string, role: WorkspaceMember['role']) => void;
  isCurrentUser?: boolean;
}

export function MemberRow({
  member,
  onRoleChange,
  isCurrentUser = false,
}: MemberRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">
          {member.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{member.name}</p>
          <p className="text-xs text-muted-foreground">{member.email}</p>
        </div>
      </div>

      <Select
        aria-label={`Role de ${member.name}`}
        value={member.role}
        disabled={isCurrentUser}
        onChange={(e) =>
          onRoleChange(member.id, e.target.value as WorkspaceMember['role'])
        }
        className="w-40"
      >
        <option value="admin">Administrador</option>
        <option value="reviewer">Revisor</option>
        <option value="viewer">Visualizador</option>
      </Select>
    </div>
  );
}
