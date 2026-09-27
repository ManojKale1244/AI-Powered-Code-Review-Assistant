import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ProviderType } from '@prisma/client';
import { AIProviderInterface, ProviderConfig } from './interfaces';
import { OpenAIProvider } from './providers';
import { encrypt, decrypt } from '../common/utils';

/**
 * AiService — Factory + facade for AI providers.
 *
 * Responsibilities:
 * 1. CRUD for user's AI provider configurations
 * 2. Factory method to instantiate the correct provider at runtime
 * 3. Encrypt/decrypt API keys at rest
 */
@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new AI provider configuration.
   * API key is encrypted before storage.
   */
  async createProviderConfig(
    userId: string,
    data: {
      providerType: ProviderType;
      name: string;
      apiKey?: string;
      baseUrl?: string;
      model: string;
      isDefault?: boolean;
    },
  ) {
    // If setting as default, unset existing defaults
    if (data.isDefault) {
      await this.prisma.aIProviderConfig.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Encrypt API key if provided
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    const encryptedApiKey =
      data.apiKey && encryptionKey
        ? encrypt(data.apiKey, encryptionKey)
        : data.apiKey;

    return this.prisma.aIProviderConfig.create({
      data: {
        ...data,
        apiKey: encryptedApiKey,
        userId,
      },
      select: {
        id: true,
        providerType: true,
        name: true,
        baseUrl: true,
        model: true,
        isDefault: true,
        createdAt: true,
        // Never return apiKey
      },
    });
  }

  /**
   * List all provider configs for a user.
   * API keys are never returned.
   */
  async getProviderConfigs(userId: string) {
    return this.prisma.aIProviderConfig.findMany({
      where: { userId },
      select: {
        id: true,
        providerType: true,
        name: true,
        baseUrl: true,
        model: true,
        isDefault: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update a provider config.
   */
  async updateProviderConfig(
    id: string,
    userId: string,
    data: {
      name?: string;
      apiKey?: string;
      baseUrl?: string;
      model?: string;
      isDefault?: boolean;
    },
  ) {
    const config = await this.prisma.aIProviderConfig.findUnique({
      where: { id },
    });

    if (!config || config.userId !== userId) {
      throw new NotFoundException('Provider config not found');
    }

    if (data.isDefault) {
      await this.prisma.aIProviderConfig.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Encrypt new API key if provided
    if (data.apiKey) {
      const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
      if (encryptionKey) {
        data.apiKey = encrypt(data.apiKey, encryptionKey);
      }
    }

    return this.prisma.aIProviderConfig.update({
      where: { id },
      data,
      select: {
        id: true,
        providerType: true,
        name: true,
        baseUrl: true,
        model: true,
        isDefault: true,
        createdAt: true,
      },
    });
  }

  /**
   * Delete a provider config.
   */
  async deleteProviderConfig(id: string, userId: string) {
    const config = await this.prisma.aIProviderConfig.findUnique({
      where: { id },
    });

    if (!config || config.userId !== userId) {
      throw new NotFoundException('Provider config not found');
    }

    return this.prisma.aIProviderConfig.delete({ where: { id } });
  }

  /**
   * Get an AI provider instance for a user.
   * Uses the user's default provider, or a specific one by ID.
   *
   * This is the factory method that implements the Strategy pattern.
   */
  async getProvider(
    userId: string,
    configId?: string,
  ): Promise<AIProviderInterface> {
    let config;

    if (configId) {
      config = await this.prisma.aIProviderConfig.findUnique({
        where: { id: configId },
      });
      if (!config || config.userId !== userId) {
        throw new NotFoundException('Provider config not found');
      }
    } else {
      // Use default provider
      config = await this.prisma.aIProviderConfig.findFirst({
        where: { userId, isDefault: true },
      });
      if (!config) {
        // Fallback to first provider
        config = await this.prisma.aIProviderConfig.findFirst({
          where: { userId },
        });
      }
    }

    if (!config) {
      throw new BadRequestException(
        'No AI provider configured. Please add one in Settings.',
      );
    }

    // Decrypt API key
    let apiKey = config.apiKey;
    if (apiKey) {
      const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
      if (encryptionKey) {
        try {
          apiKey = decrypt(apiKey, encryptionKey);
        } catch {
          // Key might not be encrypted (legacy), use as-is
        }
      }
    }

    const providerConfig: ProviderConfig = {
      apiKey: apiKey || undefined,
      baseUrl: config.baseUrl || undefined,
      model: config.model,
    };

    // All supported providers use the OpenAI-compatible interface
    // This is the key insight: LM Studio, Ollama, OpenRouter all speak OpenAI's protocol
    switch (config.providerType) {
      case 'OPENAI':
        return new OpenAIProvider(providerConfig);
      case 'LM_STUDIO':
        return new OpenAIProvider({
          ...providerConfig,
          baseUrl: providerConfig.baseUrl || 'http://localhost:1234/v1',
        });
      case 'COMPATIBLE':
      case 'OLLAMA':
        return new OpenAIProvider({
          ...providerConfig,
          baseUrl:
            providerConfig.baseUrl || 'http://localhost:11434/v1',
        });
      case 'OPEN_ROUTER':
        return new OpenAIProvider({
          ...providerConfig,
          baseUrl: 'https://openrouter.ai/api/v1',
        });
      default:
        throw new BadRequestException(
          `Unsupported provider type: ${config.providerType}`,
        );
    }
  }

  /**
   * Test connection to an AI provider configuration.
   * Validates API keys and endpoints with actionable feedback.
   */
  async testConnection(data: {
    providerType: ProviderType;
    apiKey?: string;
    baseUrl?: string;
    model: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      let baseUrl = data.baseUrl;
      if (data.providerType === ProviderType.LM_STUDIO && !baseUrl) {
        baseUrl = 'http://localhost:1234/v1';
      } else if (data.providerType === ProviderType.OLLAMA && !baseUrl) {
        baseUrl = 'http://localhost:11434/v1';
      } else if (data.providerType === ProviderType.OPEN_ROUTER && !baseUrl) {
        baseUrl = 'https://openrouter.ai/api/v1';
      } else if (data.providerType === ProviderType.OPENAI && !baseUrl) {
        baseUrl = 'https://api.openai.com/v1';
      }

      if (data.providerType === ProviderType.OPENAI && !data.apiKey) {
        return {
          success: false,
          message: 'Please enter your OpenAI API key before testing.',
        };
      }

      if (data.providerType === ProviderType.OPEN_ROUTER && !data.apiKey) {
        return {
          success: false,
          message: 'Please enter your OpenRouter API key before testing.',
        };
      }

      const provider = new OpenAIProvider({
        apiKey: data.apiKey,
        baseUrl,
        model: data.model,
      });

      const response = await provider.chatCompletion({
        messages: [{ role: 'user', content: 'Ping' }],
        maxTokens: 5,
      });

      if (response && response.length > 0) {
        return {
          success: true,
          message: 'Connection successful! Provider is responsive and ready for reviews.',
        };
      }
      return { success: false, message: 'Received empty response from provider.' };
    } catch (err: any) {
      const errMsg = err?.message || 'Unable to connect to provider.';
      if (
        errMsg.includes('401') ||
        errMsg.includes('Incorrect API key') ||
        errMsg.includes('invalid_api_key')
      ) {
        return {
          success: false,
          message: 'Authentication failed: Invalid API key provided.',
        };
      }
      if (
        errMsg.includes('429') ||
        errMsg.includes('insufficient_quota') ||
        errMsg.includes('credit_balance_exhausted') ||
        errMsg.includes('quota')
      ) {
        return {
          success: false,
          message:
            'OpenAI Quota Exhausted (429): Your account balance has $0 remaining credits. Add credits at platform.openai.com/settings/organization/billing or switch to a free OpenRouter model / local Ollama.',
        };
      }
      if (errMsg.includes('ECONNREFUSED')) {
        return {
          success: false,
          message: `Connection refused at ${data.baseUrl || 'local endpoint'}. Ensure your local server (LM Studio / Ollama) is running.`,
        };
      }
      if (errMsg.includes('404') || errMsg.includes('model_not_found')) {
        return {
          success: false,
          message: `Model "${data.model}" not found at provider endpoint.`,
        };
      }
      return { success: false, message: errMsg };
    }
  }
}
