/**
 * ZT-005 — MockProvider fixtures for ZapTrail onboarding
 * Ponytail: minimal mock data using building blocks (JSON fixtures), English identifiers only
 * 
 * These fixtures simulate WhatsApp conversation data for the onboarding flow,
 * enabling demonstration of the core value before any real provider is connected.
 */

// Mock conversation fixtures for 1:1 and group scenarios

/**
 * Fixture: 1:1 conversation with pending task
 * Simulates a conversation where a task was mentioned but not registered
 */
export const conversation1x1PendingTask = {
  id: 'conv_1x1_001',
  type: '1:1',
  participants: ['551199999-1', '551199999-2'],
  isGroup: false,
  lastActivityAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  messages: [
    {
      id: 'msg_1',
      from: '551199999-1',
      to: '551199999-2',
      body: 'Preciso enviar a proposta para João até sexta-feira.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      kind: 'message',
    },
    {
      id: 'msg_2',
      from: '551199999-2',
      to: '551199999-1',
      body: 'Ok, vou me lembrar.',
      timestamp: new Date(Date.now() - 86300000).toISOString(),
      kind: 'message',
    },
  ],
  extractedObjects: [
    {
      id: 'obj_1',
      type: 'task',
      title: 'Enviar proposta para João até sexta-feira',
      originMessageId: 'msg_1',
      confidence: 0.92,
      status: 'pending',
      deadline: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
      evidence: {
        messageId: 'msg_1',
        excerpt: 'Preciso enviar a proposta para João até sexta-feira.',
      },
    },
  ],
};

/**
 * Fixture: Group conversation with multiple decisions
 * Simulates a group conversation with multiple decisions recorded
 */
export const conversationGroupDecisions = {
  id: 'conv_group_001',
  type: 'group',
  participants: ['551199999-3', '551199999-4', '551199999-5'],
  isGroup: true,
  groupName: 'Projeto Alpha',
  lastActivityAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
  messages: [
    {
      id: 'msg_g1',
      from: '551199999-3',
      to: '551199999-5',
      body: 'Decisão: vamos migrar para o novo sistema na próxima semana.',
      timestamp: new Date(Date.now() - 43200000).toISOString(),
      kind: 'message',
    },
    {
      id: 'msg_g2',
      from: '551199999-4',
      to: '551199999-5',
      body: 'Concordo. A tarefa de migration será delegada a Maria.',
      timestamp: new Date(Date.now() - 43100000).toISOString(),
      kind: 'message',
    },
    {
      id: 'msg_g3',
      from: '551199999-5',
      to: '551199999-3',
      body: 'Prazo: sexta-feira de manhã.',
      timestamp: new Date(Date.now() - 43000000).toISOString(),
      kind: 'message',
    },
  ],
  extractedObjects: [
    {
      id: 'obj_g_1',
      type: 'decision',
      title: 'Migrar para o novo sistema na próxima semana',
      originMessageId: 'msg_g1',
      confidence: 0.95,
      status: 'confirmed',
      metadata: {
        deadline: 'next_week_morning',
        assignedTo: 'maria',
      },
      evidence: {
        messageId: 'msg_g1',
        excerpt: 'Decisão: vamos migrar para o novo sistema na próxima semana.',
      },
    },
    {
      id: 'obj_g_2',
      type: 'task',
      title: 'Task de migração delegada a Maria',
      originMessageId: 'msg_g2',
      confidence: 0.88,
      status: 'pending',
      metadata: {
        assignedTo: 'maria',
      },
      evidence: {
        messageId: 'msg_g2',
        excerpt: 'Concordo. A tarefa de migration será delegada a Maria.',
      },
    },
  ],
};

/**
 * Fixture: Conversation with commitment/confirmation
 * Simulates a promise/payment commitment that was made
 */
export const conversationCommitment = {
  id: 'conv_commitment_001',
  type: '1:1',
  participants: ['551199999-6', '551199999-7'],
  isGroup: false,
  lastActivityAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  messages: [
    {
      id: 'msg_c1',
      from: '551199999-6',
      to: '551199999-7',
      body: 'Vou pagar a conta do jantar hoje.',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      kind: 'message',
    },
    {
      id: 'msg_c2',
      from: '551199999-7',
      to: '551199999-6',
      body: 'Confirmado. Vou transferir via PIX.',
      timestamp: new Date(Date.now() - 259100000).toISOString(),
      kind: 'message',
    },
  ],
  extractedObjects: [
    {
      id: 'obj_c_1',
      type: 'commitment',
      title: 'Pagar conta do jantar hoje',
      originMessageId: 'msg_c1',
      confidence: 0.97,
      status: 'confirmed',
      metadata: {
        paymentMethod: 'pix',
        deadline: new Date().toISOString(), // today
      },
      evidence: {
        messageId: 'msg_c1',
        excerpt: 'Vou pagar a conta do jantar hoje.',
      },
    },
  ],
};

/**
 * Fixture: Conversation with opportunity detection
 * Simulates a business opportunity mentioned in conversation
 */
export const conversationOpportunity = {
  id: 'conv_opportunity_001',
  type: '1:1',
  participants: ['551199999-8', '551199999-9'],
  isGroup: false,
  lastActivityAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  messages: [
    {
      id: 'msg_o1',
      from: '551199999-8',
      to: '551199999-9',
      body: 'O cliente X demonstrou interesse em nosso plano anual e pediu condições especiais.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      kind: 'message',
    },
    {
      id: 'msg_o2',
      from: '551199999-9',
      to: '551199999-8',
      body: 'Vou analisar as condições e te retorno até amanhã.',
      timestamp: new Date(Date.now() - 172700000).toISOString(),
      kind: 'message',
    },
  ],
  extractedObjects: [
    {
      id: 'obj_o_1',
      type: 'opportunity',
      title: 'Cliente X interessado em plano anual com condições especiais',
      originMessageId: 'msg_o1',
      confidence: 0.91,
      status: 'pending',
      metadata: {
        potentialValue: 'high',
        followUpDeadline: new Date(Date.now() + 86400000).toISOString(), // 1 day from now
      },
      evidence: {
        messageId: 'msg_o1',
        excerpt: 'O cliente X demonstrou interesse em nosso plano anual e pediu condições especiais.',
      },
    },
  ],
};

/**
 * Onboarding state fixtures
 * Simulates user progress through the onboarding flow
 */
export const onboardingFixtures = {
  userWelcome: {
    userId: 'user_onboard_1',
    step: 'welcome',
    completed: false,
    data: {},
  },
  workspaceSetup: {
    userId: 'user_onboard_1',
    step: 'workspace_setup',
    completed: false,
    data: {
      workspaceName: 'Minha Empresa',
      plan: 'free',
    },
  },
  providerConnection: {
    userId: 'user_onboard_1',
    step: 'provider_connection',
    completed: false,
    data: {
      providerType: 'mock',
      whatsappNumber: '551199999-1',
      connectionStatus: 'pending',
    },
  },
  firstConversation: {
    userId: 'user_onboard_1',
    step: 'first_conversation',
    completed: false,
    data: {
      selectedConversation: 'conv_1x1_001',
      objectsDetected: 0,
    },
  },
  complete: {
    userId: 'user_onboard_1',
    step: 'complete',
    completed: true,
    data: {
      onboardingCompletedAt: new Date().toISOString(),
      workspaceId: 'ws_default',
    },
  },
};