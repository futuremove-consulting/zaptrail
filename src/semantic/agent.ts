/** ZT-014 — ZapTrail Liberated Read-Only Agent
 * Ponytail: read-only agent with confirmed limited mutations, English identifiers only
 * No external irreversible actions — all mutations require explicit user confirmation
 * Agent queries context, pending objects, decisions, evidence — returns structured responses
 * Following the "identidade → autorização → recuperação → evidência → resposta/ação" pipeline
 * All architectural decisions frozen (global_rules.md §9, all ADRs fechado)
 */

import { useState, useEffect } from 'react'
import { extractObjectFromMessage, batchExtractObjects, inferObjectType } from '@/semantic/extractor'
import { onboardingFixtures } from '@/mocks/whatsapp/mock-fixtures'
import { managementObjects } from '@/app/(app)/onboarding/onboarding.context' // placeholder for actual context

/** Agent action types — per ZT-014 read-only policy */
export type AgentActionType = 'read-only' | 'confirmable' | 'irreversible'

/** Agent response format (per journey docs §8, §13, §ZT-014) */
export type AgentResponse = {
  /** Resposta direta ao usuário */
  respostaDireta: string
  /** Contexto: pessoa/empresa/projeto/período */
  contexto: string
  /** Itens relevantes prioritários (máximo 3 em tela pequena) */
  itensRelevantes: Array<{
    tipo: 'task' | 'decision' | 'opportunity' | 'commitment' | 'alert'
    titulo: string
    status: 'pending' | 'confirmed' | 'rejected'
    prazo?: string
    evidencia: string
  }>
  /** Evidência da origem da consulta */
  evidencia: {
    mensagemId: string
    excerto: string
  }
  /** Ações disponíveis — todas read-only ou confirmable, nunca irreversible */
  acoes: Array<{
    label: string
    descricao: string
    /** Tipo de ação: read-only (apenas leitura), confirmable (requer confirmação do usuário) */
    tipo: AgentActionType
  }>
}

/** Simulated read-only agent that uses the shared semantic core */
export function useReadOnlyAgent(workspaceId: string) {
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<AgentResponse | null>(null)
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    action: AgentResponse['acoes'][0]
    resolve: (value: boolean) => void
  } | null>(null)

  const confirmAction = (action: AgentResponse['acoes'][0]): Promise<boolean> => {
    // In production, this would show a modal dialog
    // For now, return a promise that resolves after user interaction
    return new Promise((resolve) => {
      // Simulate confirmation dialog — in real app this would be a modal
      const confirmed = window.confirm(
        `Confirm action: ${action.descricao}\n\nThis action will be logged and confirmed.`
      )
      resolve(confirmed)
    })
  }

  const ask = async (question: string): Promise<AgentResponse> => {
    setLoading(true)

    try {
      // Simulate semantic extraction from onboarding fixtures or real messages
      const fixture = onboardingFixtures.complete
      const messages = fixture.data?.selectedConversation
        ? [] // would query real messages in production
        : []

      // If we have messages, extract objects; otherwise return structured context
      let items: AgentResponse['itensRelevantes'] = []
      let evidencia = { mensagemId: 'demo', excerto: 'Demo mode — no messages loaded' }

      if (messages && messages.length > 0) {
        const extracted = batchExtractObjects(messages, workspaceId)
        items = extracted.map((obj) => ({
          tipo: obj.type,
          titulo: obj.title,
          status: obj.status,
          prazo: obj.metadata?.deadline,
          evidencia: obj.evidencia?.excerpt || 'Sem excerto disponível',
        }))

        if (extracted.length > 0) {
          evidencia = {
            mensagemId: extracted[0].originMessageId,
            excerto: extracted[0].evidence?.excerpt || 'Sem excerto disponível',
          }
        }
      }

      const response: AgentResponse = {
        respostaDireta: `Encontrei ${items.length} item(ns) relevante(s) na sua conversa.`,
        contexto: `Workspace: ${workspaceId || 'Demo'} • Agente read-only • Modo demonstração`,
        itensRelevantes: items.slice(0, 3), // limit to 3 for mobile screen
        evidencia,
        acoes: [
          { label: 'Ver detalhes', descricao: 'Abrir detalhe do objeto', tipo: 'read-only' },
          { label: 'Mostrar na conversa', descricao: 'Deep link para conversa original', tipo: 'read-only' },
          {
            label: 'Confirmar',
            descricao: 'Confirmar objeto pendente',
            tipo: 'confirmable',
          },
        ],
      }

      setLastResponse(response)
      return response
    } catch (error) {
      console.error('Agent error:', error)

      const fallback: AgentResponse = {
        respostaDireta: 'Desculpe, não foi possível processar sua pergunta no momento. Tente novamente.',
        contexto: `Workspace: ${workspaceId || 'Demo'} • Erro no processamento`,
        itensRelevantes: [],
        evidencia: { mensagemId: 'error', excerto: 'Erro interno' },
        acoes: [
          { label: 'Tentar novamente', descricao: 'Refazer a pergunta', tipo: 'read-only' },
        ],
      }

      setLastResponse(fallback)
      return fallback
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (acao: AgentResponse['acoes'][0]) => {
    if (acao.tipo === 'irreversible') {
      console.error('Blocked: irreversible action not permitted in read-only mode')
      return
    }

    if (acao.tipo === 'confirmable') {
      // Require explicit user confirmation before proceeding
      const confirmed = await confirmAction(acao)
      if (!confirmed) {
        // User declined — show feedback, don't proceed
        console.log('Action declined by user')
        return
      }
      // TODO: In production, would trigger the confirmed mutation here
      // All mutations go through confirmed channels only
      console.log('Action confirmed by user:', acao.label)
      return
    }

    if (acao.tipo === 'read-only') {
      // No action needed — just inform the user
      console.log('Read-only action selected:', acao.label)
      return
    }
  }

  return {
    ask,
    handleAction,
    loading,
    lastResponse,
    pendingConfirmation,
  }
}

/** Agent question templates (per journey docs §6, §7) */
export const agentQuestions = {
  contexto: (entity: string) =>
    `O que sei sobre ${entity}?`,

  historico: () => 'Qual foi o último contato?',

  pendencias: () => 'O que ficou pendente?',

  decisoes: () => 'O que foi decidido?',

  agenda: () => 'O que tenho hoje?',

  projeto: (project: string) => `Como está o projeto ${project}?`,

  conversa: (mensagemId: string) =>
    `Mostre onde isso foi dito (${mensagemId})`,

  criar: (descricao: string) =>
    `Anote/crie/registe: ${descricao}`,

  alterar: (descricao: string) =>
    `Adie/conclua/corrija: ${descricao}`,

  timeline: () => 'Abra a timeline',
}

/** Render agent response in UI (per journey docs §8, §131-145, §ZT-014) */
export function AgentResponseDisplay({
  response,
  onAction,
}: {
  response: AgentResponse
  onAction: (acao: AgentResponse['acoes'][0]) => void
}) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{response.respostaDireta}</p>

      {response.contexto && (
        <p className="text-sm text-gray-500 mb-4">
          Contexto: {response.contexto}
        </p>
      )}

      {response.itensRelevantes.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Itens relevantes:</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {response.itensRelevantes.map((item, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="w-1 h-1 rounded-full mt-2 mr-2">
                  {item.tipo === 'task'
                    ? '📌'
                    : item.tipo === 'decision'
                    ? '📋'
                    : item.tipo === 'opportunity'
                    ? '💡'
                    : item.tipo === 'commitment'
                    ? '✅'
                    : '⚠️'}
                </span>
                <div>
                  <p className="font-medium">{item.titulo}</p>
                  {item.prazo && (
                    <p className="text-xs text-gray-500">
                      Prazo: {item.prazo}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    Evidência: {item.evidencia.substring(0, 100)}{{
                      item.evidencia.length > 100
                        ? '...'
                        : ''}}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {response.evidencia && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h5 className="font-medium text-gray-600 mb-2">Evidência:</h5>
          <p className="text-sm text-gray-500">{response.evidencia.excerto}</p>
        </div>
      )}

      <div>
        <h5 className="font-semibold text-gray-600 mb-3">Ações:</h5>
        <div className="grid grid-cols-2 gap-2">
          {response.acoes.map((acao) => (
            <button
              key={acao.label}
              className="rounded px-3 py-1 text-sm ${
                acao.tipo === 'read-only' ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white'
              } hover-opacity-80 transition-colors"
              onClick={() => onAction(acao)}
            >
              {acao.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}