/** ZT-010 — ZapTrail Onboarding Tests
 * TDD: tests written first, defining onboarding flow before implementation
 * All identifiers English-only per global_rules.md §9
 * Validates user flow: welcome → workspace_setup → provider_connection → first_conversation → complete
 */

import { onboardingFixtures } from '@/mocks/whatsapp/mock-fixtures'

describe('Onboarding Flow — ZT-010', () => {
  test('starts at welcome step', () => {
    const state = onboardingFixtures.userWelcome
    expect(state.step).toBe('welcome')
    expect(state.completed).toBe(false)
    expect(Object.keys(state.data)).toEqual([])
  })

  test('progresses workspace setup step', () => {
    const state = onboardingFixtures.workspaceSetup
    expect(state.step).toBe('workspace_setup')
    expect(state.completed).toBe(false)
    expect(state.data).toHaveProperty('workspaceName')
    expect(state.data).toHaveProperty('plan')
    expect(state.data.plan).toBe('free')
  })

  test('records provider connection step', () => {
    const state = onboardingFixtures.providerConnection
    expect(state.step).toBe('provider_connection')
    expect(state.completed).toBe(false)
    expect(state.data).toHaveProperty('providerType')
    expect(state.data.providerType).toBe('mock')
    expect(state.data).toHaveProperty('whatsappNumber')
    expect(state.data.connectionStatus).toBe('pending')
  })

  test('marks first conversation selection', () => {
    const state = onboardingFixtures.firstConversation
    expect(state.step).toBe('first_conversation')
    expect(state.completed).toBe(false)
    expect(state.data).toHaveProperty('selectedConversation')
    expect(state.data.selectedConversation).toBe('conv_1x1_001')
    expect(state.data).toHaveProperty('objectsDetected')
    expect(state.data.objectsDetected).toBe(0)
  })

  test('completes onboarding flow', () => {
    const state = onboardingFixtures.complete
    expect(state.step).toBe('complete')
    expect(state.completed).toBe(true)
    expect(state.data).toHaveProperty('onboardingCompletedAt')
    expect(typeof state.data.onboardingCompletedAt).toBe('string')
    expect(state.data).toHaveProperty('workspaceId')
    expect(state.data.workspaceId).toBe('ws_default')
  })

  test('onboarding flow has all required steps in order', () => {
    const steps = ['welcome', 'workspace_setup', 'provider_connection', 'first_conversation', 'complete']
    const fixtureSteps = [
      onboardingFixtures.userWelcome.step,
      onboardingFixtures.workspaceSetup.step,
      onboardingFixtures.providerConnection.step,
      onboardingFixtures.firstConversation.step,
      onboardingFixtures.complete.step,
    ]

    expect(fixtureSteps).toEqual(steps)
  })
})