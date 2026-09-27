/**
 * AI Provider interface — Strategy Pattern.
 *
 * Every AI provider (OpenAI, LM Studio, Compatible) implements this interface.
 * The AiService selects the appropriate provider at runtime based on user config.
 *
 * Design decision: Use Strategy pattern, not inheritance.
 * - Easy to add new providers (Open/Closed Principle)
 * - Each provider is independently testable
 * - No deep inheritance hierarchies
 */
export interface AIProviderInterface {
  /**
   * Send a chat completion request.
   * Returns the AI's response as a string.
   */
  chatCompletion(params: ChatCompletionParams): Promise<string>;

  /**
   * Send a chat completion request with streaming.
   * Returns an async generator of content chunks.
   */
  chatCompletionStream(
    params: ChatCompletionParams,
  ): AsyncGenerator<string, void, unknown>;
}

export interface ChatCompletionParams {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model: string;
}
