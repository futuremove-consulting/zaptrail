/** ZT-011 — ZapTrail Read-Only Agent Tests
 * TDD: tests written first, defining agent behavior before implementation
 * All identifiers English-only per global_rules.md §9
 * Tests agent query templates and response rendering
 */

import { useReadOnlyAgent, agentQuestions, AgentResponse } from '@/semantic/agent'
import { onboardingFixtures } from '@/mocks/whatsapp/mock-fixtures'

describe('Read-Only Agent — ZT-011', () => {
  test('agentQuestions.contexto generates correct format', () => {
    const result = agentQuestions.contexto('João')
    expect(result).toBe('O que sei sobre João?')
  })

  test('agentQuestions.historico generates correct format', () => {
    const result = agentQuestions.historico()
    expect(result).toBe('Qual foi o último contato?')
  })

  test('agentQuestions.pendencias generates correct format', () => {
    const result = agentQuestions.pendencias()
    expect(result).toBe('O que ficou pendente?')
  })

  test('agentQuestions.decisoes generates correct format', () => {
    const result = agentQuestions.decisoes()
    expect(result).toBe('O que foi decidido?')
  })

  test('agentQuestions.agenda generates correct format', () => {
    const result = agentQuestions.agenda()
    expect(result).toBe('O que tenho hoje?')
  })

  test('agentQuestions.projeto generates correct format', () => {
    const result = agentQuestions.projeto('Projeto Alpha')
    expect(result).toBe('Como está o projeto Projeto Alpha?')
  })

  test('agentQuestions.conversa generates correct format', () => {
    const result = agentQuestions.conversa('msg_1')
    expect(result).toBe('Mostre onde isso foi dito (msg_1)')
  })

  test('agentQuestions.criar generates correct format', () => {
    const result = agentQuestions.criar('enviar proposta para João')
    expect(result).toBe('Anote/crie/registe: enviar proposta para João')
  })

  test('agentQuestions.alterar generates correct format', () => {
    const result = agentQuestions.alterar('concluir tarefa')
    expect(result).toBe('Adie/conclua/corrija: concluir tarefa')
  })

  test('agentQuestions.timeline generates correct format', () => {
    const result = agentQuestions.timeline()
    expect(result).toBe('Abra a timeline')
  })
})