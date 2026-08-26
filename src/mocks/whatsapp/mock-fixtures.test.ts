/** ZT-009 — ZapTrail Mock Fixtures Tests
 * TDD: tests written first, defining expected fixture structures
 * All identifiers English-only per global_rules.md §9
 * Validates onboarding flow data structures
 */

import { conversation1x1PendingTask, conversationGroupDecisions, conversationCommitment, conversationOpportunity, onboardingFixtures } from './mock-fixtures'

describe('Mock Fixtures — conversation1x1PendingTask', () => {
  test('has required fields for 1:1 task extraction', () => {
    expect(conversation1x1PendingTask).toHaveProperty('id')
    expect(conversation1x1PendingTask).toHaveProperty('type')
    expect(conversation1x1PendingTask).toHaveProperty('participants')
    expect(conversation1x1PendingTask).toHaveProperty('isGroup')
    expect(conversation1x1PendingTask).toHaveProperty('messages')
    expect(conversation1x1PendingTask).toHaveProperty('extractedObjects')

    expect(conversation1x1PendingTask.type).toBe('1:1')
    expect(Array.isArray(conversation1x1PendingTask.participants)).toBe(true)
    expect(Array.isArray(conversation1x1PendingTask.messages)).toBe(true)
    expect(Array.isArray(conversation1x1PendingTask.extractedObjects)).toBe(true)
  })

  test('contains task extraction in extractedObjects', () => {
    expect(conversation1x1PendingTask.extractedObjects).toHaveLength(1)
    expect(conversation1x1PendingTask.extractedObjects[0]).toHaveProperty('type')
    expect(conversation1x1PendingTask.extractedObjects[0].type).toBe('task')
    expect(conversation1x1PendingTask.extractedObjects[0]).toHaveProperty('title')
    expect(conversation1x1PendingTask.extractedObjects[0]).toHaveProperty('originMessageId')
    expect(conversation1x1PendingTask.extractedObjects[0]).toHaveProperty('confidence')
    expect(conversation1x1PendingTask.extractedObjects[0]).toHaveProperty('status')
    expect(conversation1x1PendingTask.extractedObjects[0]).toHaveProperty('evidence')
  })
})

describe('Mock Fixtures — conversationGroupDecisions', () => {
  test('has required fields for group decisions', () => {
    expect(conversationGroupDecisions).toHaveProperty('id')
    expect(conversationGroupDecisions).toHaveProperty('type')
    expect(conversationGroupDecisions).toHaveProperty('participants')
    expect(conversationGroupDecisions).toHaveProperty('isGroup')
    expect(conversationGroupDecisions).toHaveProperty('groupName')
    expect(conversationGroupDecisions).toHaveProperty('messages')
    expect(conversationGroupDecisions).toHaveProperty('extractedObjects')

    expect(conversationGroupDecisions.type).toBe('group')
    expect(conversationGroupDecisions.groupName).toBe('Projeto Alpha')
  })

  test('contains decision and task extractions', () => {
    expect(conversationGroupDecisions.extractedObjects).toHaveLength(2)
    expect(conversationGroupDecisions.extractedObjects[0].type).toBe('decision')
    expect(conversationGroupDecisions.extractedObjects[1].type).toBe('task')
  })
})

describe('Mock Fixtures — conversationCommitment', () => {
  test('has required fields for commitment extraction', () => {
    expect(conversationCommitment).toHaveProperty('id')
    expect(conversationCommitment).toHaveProperty('type')
    expect(conversationCommitment).toHaveProperty('participants')
    expect(conversationCommitment).toHaveProperty('isGroup')
    expect(conversationCommitment).toHaveProperty('messages')
    expect(conversationCommitment).toHaveProperty('extractedObjects')

    expect(conversationCommitment.type).toBe('1:1')
  })

  test('contains commitment extraction', () => {
    expect(conversationCommitment.extractedObjects).toHaveLength(1)
    expect(conversationCommitment.extractedObjects[0].type).toBe('commitment')
    expect(conversationCommitment.extractedObjects[0]).toHaveProperty('metadata')
    expect(conversationCommitment.extractedObjects[0].metadata).toHaveProperty('paymentMethod')
  })
})

describe('Mock Fixtures — conversationOpportunity', () => {
  test('has required fields for opportunity extraction', () => {
    expect(conversationOpportunity).toHaveProperty('id')
    expect(conversationOpportunity).toHaveProperty('type')
    expect(conversationOpportunity).toHaveProperty('participants')
    expect(conversationOpportunity).toHaveProperty('isGroup')
    expect(conversationOpportunity).toHaveProperty('messages')
    expect(conversationOpportunity).toHaveProperty('extractedObjects')

    expect(conversationOpportunity.type).toBe('1:1')
  })

  test('contains opportunity extraction', () => {
    expect(conversationOpportunity.extractedObjects).toHaveLength(1)
    expect(conversationOpportunity.extractedObjects[0].type).toBe('opportunity')
    expect(conversationOpportunity.extractedObjects[0]).toHaveProperty('metadata')
    expect(conversationOpportunity.extractedObjects[0].metadata).toHaveProperty('potentialValue')
  })
})

describe('Mock Fixtures — onboardingFixtures', () => {
  test('has all onboarding steps', () => {
    expect(onboardingFixtures).toHaveProperty('userWelcome')
    expect(onboardingFixtures).toHaveProperty('workspaceSetup')
    expect(onboardingFixtures).toHaveProperty('providerConnection')
    expect(onboardingFixtures).toHaveProperty('firstConversation')
    expect(onboardingFixtures).toHaveProperty('complete')
  })

  test('welcome step has initial data', () => {
    expect(onboardingFixtures.userWelcome.step).toBe('welcome')
    expect(onboardingFixtures.userWelcome.completed).toBe(false)
    expect(onboardingFixtures.userWelcome.data).toEqual({})
  })

  test('complete step marks onboarding as done', () => {
    expect(onboardingFixtures.complete.step).toBe('complete')
    expect(onboardingFixtures.complete.completed).toBe(true)
    expect(onboardingFixtures.complete.data).toHaveProperty('onboardingCompletedAt')
    expect(onboardingFixtures.complete.data).toHaveProperty('workspaceId')
  })
})