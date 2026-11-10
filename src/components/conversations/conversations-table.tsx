import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export interface ConversationSummaryItem {
  conversation_id: string;
  contact_name: string;
  messages_count: number;
  extractions_count: number;
  opportunities_count: number;
  last_activity_at: string;
}

interface ConversationsTableProps {
  conversations: ConversationSummaryItem[];
}

export function ConversationsTable({ conversations }: ConversationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Conversa
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Mensagens
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Extrações
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Oportunidades
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Última Atividade
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {conversations.map((conv) => (
            <tr
              key={conv.conversation_id}
              className="transition-colors hover:bg-accent/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/conversations/${conv.conversation_id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {conv.contact_name}
                </Link>
                <p className="font-mono text-2xs text-muted-foreground">
                  {conv.conversation_id}
                </p>
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {conv.messages_count}
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {conv.extractions_count}
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary" className="font-mono">
                  {conv.opportunities_count}
                </Badge>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {new Date(conv.last_activity_at).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
