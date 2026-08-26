/** ZT-010 — ZapTrail Onboarding Page
 * Ponytail: minimal onboarding flow using MockProvider, English identifiers only
 * Guides user through: welcome → workspace_setup → provider_connection → first_conversation → complete
 */

import { useState, useEffect } from 'react'
import { onboardingFixtures } from '@/mocks/whatsapp/mock-fixtures'
import { MockWhatsAppProvider } from '@/providers/whatsapp/mockProvider'

export function OnboardingPage() {
  const [step, setStep] = useState<'welcome' | 'workspace_setup' | 'provider_connection' | 'first_conversation' | 'complete'>('welcome')
  const [workspaceName, setWorkspaceName] = useState('Minha Empresa')
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [whatsappNumber, setWhatsappNumber] = useState('551199999-1')
  const [selectedConversation, setSelectedConversation] = useState<'conv_1x1_001' | 'conv_group_001' | 'conv_commitment_001' | 'conv_opportunity_001'>('conv_1x1_001')
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [workspaceId, setWorkspaceId] = useState('ws_default')

  // Initialize MockProvider on mount
  useEffect(() => {
    ;(async () => {
      const provider = new MockWhatsAppProvider()
      await provider.initialize()
      const status = await provider.status()
      console.log('MockProvider initialized:', status)
    })()
  }, [])

  const steps = [
    { key: 'welcome', title: 'Bem-vindo', description: 'Seja bem-vindo ao ZapTrail!' },
    {
      key: 'workspace_setup',
      title: 'Configurar Workspace',
      description: 'Digite o nome do seu workspace e escolha um plano',
    },
    {
      key: 'provider_connection',
      title: 'Conectar Provider',
      description: 'Conecte sua conta WhatsApp usando o MockProvider',
    },
    {
      key: 'first_conversation',
      title: 'Primeira Conversa',
      description: 'Seleccione uma conversa de demonstração',
    },
    { key: 'complete', title: 'Concluído', description: 'Onboarding finalizado com sucesso!' },
  ]

  const goToStep = (nextStep: typeof step) => {
    setStep(nextStep)
  }

  const handleNext = () => {
    switch (step) {
      case 'welcome':
        goToStep('workspace_setup')
        break
      case 'workspace_setup':
        goToStep('provider_connection')
        break
      case 'provider_connection':
        goToStep('first_conversation')
        break
      case 'first_conversation':
        goToStep('complete')
        break
      case 'complete':
        // Already at end
        break
    }
  }

  const handlePrev = () => {
    switch (step) {
      case 'workspace_setup':
        goToStep('welcome')
        break
      case 'provider_connection':
        goToStep('workspace_setup')
        break
      case 'first_conversation':
        goToStep('provider_connection')
        break
      case 'complete':
        goToStep('first_conversation')
        break
      case 'welcome':
        // Already at start
        break
    }
  }

  if (onboardingCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Onboarding Concluído!
          </h2>
          <p className="text-gray-600 mb-6">
            Seu workspace está pronto. Você pode começar a usar o ZapTrail.
          </p>
          <button
            onClick={() => setOnboardingCompleted(false)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Começar Novamente
          </button>
        </div>
      </div>
    )
  }

  const currentStepData = onboardingFixtures[step as keyof typeof onboardingFixtures]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <div className="flex-1 flex items-center justify-center">
            <h1 className="text-xl font-semibold text-gray-900">
              ZapTrail — Onboarding
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {/* Step indicators would go here */}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {/* Step Progress */}
        <div className="mb-8">
          <ol className="flex flex-col sm:flex-row space-x-2">
            {steps.map((s) => (
              <li
                key={s.key}
                className={`
                  flex-1 border rounded py-2 text-sm ${
                    step === s.key
                      ? 'bg-blue-600 text-white'
                      : step === steps[Math.max(0, steps.indexOf(s.key) - 1)]?.key
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-500'
                  `
                }>
                  {s.title}
                </li>
              )
            ))}
          </ol>
        </div>

        {/* Step Content */}
        <section className="bg-white rounded-xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentStepData.title}</h2>
          <p className="text-gray-600 mb-8">{currentStepData.description}</p>

          {/* Step-specific content */}
          <div className="space-y-6">
            {/* Welcome step */}
            {step === 'welcome' && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  O ZapTrail transforma conversas autorizadas em objetos de gestão
                  rastreáveis (Task, Decision, Opportunity, Commitment, Alert) com
                  evidência, proprietário e prazos. Vamos começar?
                </p>
                <button
                  onClick={handleNext}
                  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
                >
                  Começar
                </button>
              </div>
            )}

            {/* Workspace setup step */}
            {step === 'workspace_setup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Workspace
                </label>
                <input
                  value:value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 focus:ring-blue-500 focus-outline"
                  placeholder="Minha Empresa"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plano
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPlan('free')}
                    className={`
                      w-full rounded border border-gray-300 px-4 py-2 ${
                        plan === 'free' ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                      } transition-colors
                    `}
                  >
                    Free
                  </button>
                  <button
                    onClick={() => setPlan('pro')}
                    className={`
                      w-full rounded border border-gray-300 px-4 py-2 ${
                        plan === 'pro' ? 'bg-blue-100 text-blue-800' : 'text-gray-700'
                      } transition-colors`
                  >
                    Pro
                  </button>
                </div>
                <button onClick={handleNext} className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors">
                  Continuar
                </button>
              </div>
            )}

            {/* Provider connection step */}
            {step === 'provider_connection' && (
              <div>
                <p className="text-gray-700 mb-4">
                  Conectando com MockProvider (custo zero para demonstração).
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Número WhatsApp para conexão: <strong className="font-mono">{whatsappNumber}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  O MockProvider simula conversas WhatsApp sem necessidade de provedor real.
                  Ideal para demonstrar o valor central antes de conectar UAZAPI.
                </p>
                <button
                  onClick={handleNext}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* First conversation step */}
            {step === 'first_conversation' && (
              <div>
                <p className="text-gray-700 mb-4">
                  Seleccione uma conversa de demonstração para testar o núcleo do ZapTrail.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setSelectedConversation('conv_1x1_001')}
                    className={`
                      w-full rounded border border-gray-300 px-4 py-3 ${
                        selectedConversation === 'conv_1x1_001' ? 'bg-blue-100 text-blue-800 border-blue-500' : 'text-gray-700'
                      } transition-colors hover:bg-gray-50`}
                  >
                    1:1 — Task (Pending)
                  </button>
                  <button
                    onClick={() => setSelectedConversation('conv_group_001')}
                    className={`
                      w-full rounded border border-gray-300 px-4 py-3 ${
                        selectedConversation === 'conv_group_001' ? 'bg-blue-100 text-blue-800 border-blue-500' : 'text-gray-700'
                      } transition-colors hover:bg-gray-50`}
                  >
                    Group — Decisions
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedConversation('conv_commitment_001')}
                    className={`
                      w-full rounded border border-gray-300 px-4 py-3 ${
                        selectedConversation === 'conv_commitment_001' ? 'bg-blue-100 text-blue-800 border-blue-500' : 'text-gray-700'
                      } transition-colors hover:bg-gray-50`}
                  >
                    Commitment
                  </button>
                  <button
                    onClick={() => setSelectedConversation('conv_opportunity_001')}
                    className={`
                      w-full rounded border border-gray-300 px-4 py-3 ${
                        selectedConversation === 'conv_opportunity_001' ? 'bg-blue-100 text-blue-800 border-blue-500' : 'text-gray-700'
                      } transition-colors hover:bg-gray-50`}
                  >
                    Opportunity
                  </button>
                </div>
                <button
                  onClick={handleNext}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
                >
                  Concluir Onboarding
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
        <p>ZapTrail — Transformando conversas em gestão rastreável</p>
      </footer>
    </div>
  )
}