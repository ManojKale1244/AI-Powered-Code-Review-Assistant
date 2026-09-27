import OpenAI from 'openai';
import {
  AIProviderInterface,
  ChatCompletionParams,
  ProviderConfig,
} from '../interfaces';

/**
 * OpenAI-compatible provider implementation.
 *
 * This single class handles OpenAI, LM Studio, and any OpenAI-compatible API
 * because they all use the same REST interface — just different base URLs.
 *
 * - OpenAI: baseUrl = default (https://api.openai.com/v1)
 * - LM Studio: baseUrl = http://localhost:1234/v1
 * - Compatible: baseUrl = whatever the user configures
 *
 * Design decision: One class instead of three identical ones.
 * The "OpenAI-compatible" pattern means LM Studio, Ollama, OpenRouter
 * all speak the same protocol. Separate classes would be pure duplication.
 */
export class OpenAIProvider implements AIProviderInterface {
  private client: OpenAI;
  private model: string;

  constructor(config: ProviderConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey || 'not-needed', // LM Studio doesn't need a key
      baseURL: config.baseUrl, // undefined = OpenAI default
    });
    this.model = config.model;
  }

  async chatCompletion(params: ChatCompletionParams): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 4096,
    });

    return response.choices[0]?.message?.content || '';
  }

  async *chatCompletionStream(
    params: ChatCompletionParams,
  ): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.3,
      max_tokens: params.maxTokens ?? 4096,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
