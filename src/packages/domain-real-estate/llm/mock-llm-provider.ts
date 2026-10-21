import {
  LLMProvider,
  LLMExtractionRequest,
  LLMExtractionResponse,
} from '../../core/types';

export interface MockLLMProviderOptions {
  name?: string;
  defaultModel?: string;
  defaultData?: unknown;
  shouldFail?: boolean;
  failureError?: Error;
  simulateHallucination?: boolean;
}

/**
 * Deterministic mock LLM provider for tests and CI/CD.
 * Allows simulating predefined structured responses, hallucinations,
 * network failures/exceptions, and tracking token usage.
 */
export class MockLLMProvider implements LLMProvider {
  readonly name: string;
  public model: string;
  private defaultData?: unknown;
  private queuedResponses: unknown[] = [];
  private shouldFail = false;
  private failureError?: Error;
  private simulateHallucination = false;

  public callCount = 0;
  public totalPromptTokens = 0;
  public totalCompletionTokens = 0;
  public recordedRequests: LLMExtractionRequest<any>[] = [];

  constructor(options?: MockLLMProviderOptions) {
    this.name = options?.name ?? 'MockLLMProvider';
    this.model = options?.defaultModel ?? 'mock-real-estate-model';
    this.defaultData = options?.defaultData;
    this.shouldFail = options?.shouldFail ?? false;
    this.failureError = options?.failureError;
    this.simulateHallucination = options?.simulateHallucination ?? false;
  }

  setMockResponse(data: unknown): void {
    this.defaultData = data;
  }

  queueMockResponse(data: unknown): void {
    this.queuedResponses.push(data);
  }

  setSimulateFailure(fail: boolean, error?: Error): void {
    this.shouldFail = fail;
    this.failureError = error;
  }

  setSimulateHallucination(hallucinate: boolean): void {
    this.simulateHallucination = hallucinate;
  }

  reset(): void {
    this.callCount = 0;
    this.totalPromptTokens = 0;
    this.totalCompletionTokens = 0;
    this.recordedRequests = [];
    this.queuedResponses = [];
    this.shouldFail = false;
    this.failureError = undefined;
    this.simulateHallucination = false;
  }

  async extractStructured<T>(req: LLMExtractionRequest<T>): Promise<LLMExtractionResponse<T>> {
    this.callCount++;
    this.recordedRequests.push(req);

    if (this.shouldFail) {
      throw (
        this.failureError ??
        new Error('Simulated network timeout/error in MockLLMProvider')
      );
    }

    let responseData: any;
    if (this.queuedResponses.length > 0) {
      responseData = this.queuedResponses.shift();
    } else if (this.defaultData !== undefined) {
      responseData = this.defaultData;
    } else {
      responseData = {
        detected_role: { role: 'unknown', confidence: 0.5, exact_quote: '' },
        intents: [],
        properties: [],
        conditions: [],
        summary: 'Mock LLM default response',
      };
    }

    if (this.simulateHallucination && responseData) {
      responseData = JSON.parse(JSON.stringify(responseData));
      const hallucinatedQuote =
        'Esta é uma frase totalmente alucinada que não existe no texto original';
      if (responseData.detected_role) {
        responseData.detected_role.exact_quote = hallucinatedQuote;
      }
      if (Array.isArray(responseData.intents) && responseData.intents[0]) {
        responseData.intents[0].exact_quote = hallucinatedQuote;
      }
      if (Array.isArray(responseData.conditions) && responseData.conditions[0]) {
        responseData.conditions[0].exact_quote = hallucinatedQuote;
      }
    }

    const promptText = `${req.systemPrompt ?? ''}\n${req.prompt ?? ''}`;
    const promptTokens = Math.max(15, Math.ceil(promptText.length / 4));
    const completionTokens = Math.max(15, Math.ceil(JSON.stringify(responseData).length / 4));

    this.totalPromptTokens += promptTokens;
    this.totalCompletionTokens += completionTokens;

    return {
      data: responseData as T,
      rawText: JSON.stringify(responseData),
      model: this.model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }
}
