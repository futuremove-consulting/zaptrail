/** ZT-009 — ZapTrail Semantic Extractor Tests
 * TDD: tests written first, defining expected behavior before implementation
 * All identifiers English-only per global_rules.md §9
 */

import { extractObjectFromMessage, batchExtractObjects, inferObjectType, extractDeadline, extractAssignedTo } from './extractor'

describe('Semantic Extractor — inferObjectType', () => {
  test('returns "task" for "enviar proposta até sexta"', () => {
    expect(inferObjectType('enviar proposta até sexta')).toBe('task')
  })

  test('returns "decision" for "decisão: vamos migrar"', () => {
    expect(inferObjectType('decisão: vamos migrar')).toBe('decision')
  })

  test('returns "commitment" for "vou pagar o jantar"', () => {
    expect(inferObjectType('vou pagar o jantar')).toBe('commitment')
  })

  test('returns "opportunity" for "cliente X demonstrou interesse"', () => {
    expect(inferObjectType('cliente X demonstrou interesse')).toBe('opportunity')
  })

  test('returns "alert" for "atrasado há 3 dias"', () => {
    expect(inferObjectType('atrasado há 3 dias')).toBe('alert')
  })

  test('defaults to "task" for unknown messages', () => {
    expect(inferObjectType('algo aleatório sem contexto')).toBe('task')
  })
})

describe('Semantic Extractor — extractObjectFromMessage', () => {
  test('extracts task with deadline from "enviar proposta até sexta"', () => {
    const msg = {
      id: 'msg_1',
      from: '551199999-1',
      to: '551199999-2',
      body: 'enviar proposta até sexta',
      timestamp: new Date().toISOString(),
      kind: 'message',
    }

    const result = extractObjectFromMessage(msg, 'conv_1')

    expect(result.type).toBe('task')
    expect(result.title).toBe('enviar proposta até sexta')
    expect(result.evidence.messageId).toBe('msg_1')
    expect(result.metadata.deadline).toBeDefined()
    expect(result.status).toBe('pending')
    expect(result.confidence).toBeGreaterThanOrEqual(0.6)
    expect(result.confidence).toBeLessThanOrEqual(0.95)
  })

  test('extracts decision with confidence', () => {
    const msg = {
      id: 'msg_2',
      from: '551199999-3',
      to: '551199999-4',
      body: 'decisão: migrar para novo sistema',
      timestamp: new Date().toISOString(),
      kind: 'message',
    }

    const result = extractObjectFromMessage(msg, 'conv_2')

    expect(result.type).toBe('decision')
    expect(result.title).toBe('decisão: migrar para novo sistema')
    expect(result.metadata.confidence).toBeGreaterThanOrEqual(0.6)
    expect(result.metadata.confidence).toBeLessThanOrEqual(0.95)
  })

  test('extracts commitment with assignee', () => {
    const msg = {
      id: 'msg_3',
      from: '551199999-5',
      to: '551199999-6',
      body: 'vou pagar a conta do jantar hoje',
      timestamp: new Date().toISOString(),
      kind: 'message',
    }

    const result = extractObjectFromMessage(msg, 'conv_3')

    expect(result.type).toBe('commitment')
    expect(result.title).toBe('vou pagar a conta do jantar hoje')
    expect(result.metadata.assignedTo).toBeUndefined() // no name pattern matched
    expect(result.status).toBe('pending')
  })

  test('extracts opportunity with potentialValue', () => {
    const msg = {
      id: 'msg_4',
      from: '551199999-7',
      to: '551199999-8',
      body: 'cliente X demonstrou interesse em nosso plano anual',
      timestamp: new Date().toISOString(),
      kind: 'message',
    }

    const result = extractObjectFromMessage(msg, 'conv_4')

    expect(result.type).toBe('opportunity')
    expect(result.title).toBe('cliente X demonstrou interesse em nosso plano anual')
    expect(result.metadata.potentialValue).toBe('high')
    expect(result.status).toBe('pending')
  })

  test('extracts alert with low confidence cap', () => {
    const msg = {
      id: 'msg_5',
      from: '551199999-9',
      to: '551199999-10',
      body: 'atrasado há três dias',
      timestamp: new Date().toISOString(),
      kind: 'message',
    }

    const result = extractObjectFromMessage(msg, 'conv_5')

    expect(result.type).toBe('alert')
    expect(result.metadata.confidence).toBeLessThanOrEqual(0.8)
    expect(result.status).toBe('pending')
  })
})

describe('Semantic Extractor — batchExtractObjects', () => {
  test('extracts objects from multiple messages', () => {
    const messages = [
      {
        id: 'msg_1',
        from: '551199999-1',
        to: '551199999-2',
        body: 'enviar proposta até sexta',
        timestamp: new Date().toISOString(),
        kind: 'message',
      },
      {
        id: 'msg_2',
        from: '551199999-3',
        to: '551199999-4',
        body: 'decisão: migrar para novo sistema',
        timestamp: new Date().toISOString(),
        kind: 'message',
      },
    ]

    const result = batchExtractObjects(messages, 'conv_1')

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('task')
    expect(result[1].type).toBe('decision')
  })

  test('filters out non-message kinds', () => {
    const messages = [
      {
        id: 'msg_1',
        from: '551199999-1',
        to: '551199999-2',
        body: 'enviar proposta',
        timestamp: new Date().toISOString(),
        kind: 'message',
      },
      {
        id: 'msg_2',
        from: '551199999-3',
        to: '551199999-4',
        body: 'status update',
        timestamp: new Date().toISOString(),
        kind: 'status',
      },
    ]

    const result = batchExtractObjects(messages, 'conv_1')

    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('task')
  })

  test('filters out empty bodies', () => {
    const messages = [
      {
        id: 'msg_1',
        from: '551199999-1',
        to: '551199999-2',
        body: '',
        timestamp: new Date().toISOString(),
        kind: 'message',
      },
    ]

    const result = batchExtractObjects(messages, 'conv_1')

    expect(result).toHaveLength(0)
  })
})

describe('Semantic Extractor — extractDeadline', () => {
  test('extracts Friday deadline from "até sexta"', () => {
    const deadline = extractDeadline('enviar até sexta')
    expect(deadline).toBeDefined()
    const date = new Date(deadline!)
    expect(date.getDay()).toBe(5) // Friday
  })

  test('extracts tomorrow deadline from "até amanhã"', () => {
    const deadline = extractDeadline('até amanhã')
    expect(deadline).toBeDefined()
    const date = new Date(deadline!)
    const today = new Date()
    expect(date.getDate()).toBe(today.getDate() + 1)
  })

  test('returns undefined for no deadline patterns', () => {
    const deadline = extractDeadline('oi como vai')
    expect(deadline).toBeUndefined()
  })

  test('extracts Monday deadline from "próxima semana"', () => {
    const deadline = extractDeadline('até segunda')
    expect(deadline).toBeDefined()
    const date = new Date(deadline!)
    expect(date.getDay()).toBe(1) // Monday
  })
})

describe('Semantic Extractor — extractAssignedTo', () => {
  test('extracts name from "para Maria"', () => {
    const result = extractAssignedTo('para Maria')
    expect(result).toBe('Maria')
  })

  test('extracts name from "delegada a João"', () => {
    const result = extractAssignedTo('delegada a João')
    expect(result).toBe('João')
  })

  test('extracts name from "responsável por Pedro"', () => {
    const result = extractAssignedTo('responsável por Pedro')
    expect(result).toBe('Pedro')
  })

  test('returns undefined when no name pattern matches', () => {
    const result = extractAssignedTo('oi tudo bem')
    expect(result).toBeUndefined()
  })
})