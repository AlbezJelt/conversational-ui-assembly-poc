import OpenAI from 'openai';

/**
 * Intent Analyzer using OpenAI GPT-4 for understanding user messages.
 * Maps natural language to structured intents for UI assembly.
 */
export class IntentAnalyzer {
  private openai: OpenAI;
  private conversationContext: ConversationContext;
  
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.conversationContext = {
      messages: [],
      userProfile: {},
      sessionData: {}
    };
  }

  /**
   * Analyze user message and extract intent
   */
  async analyzeIntent(message: string, context?: any): Promise<IntentAnalysis> {
    try {
      // Update conversation context
      this.conversationContext.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt();
      
      // Call OpenAI for intent analysis
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Fast model for real-time analysis
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.buildContextMessages(),
          { role: 'user', content: message }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3, // Lower temperature for consistency
        max_tokens: 500
      });

      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Validate and enhance the analysis
      const analysis = this.validateAndEnhanceAnalysis(result, message);
      
      // Update conversation context with assistant understanding
      this.conversationContext.messages.push({
        role: 'assistant',
        content: `Intent: ${analysis.intent.type}`,
        timestamp: new Date()
      });

      return analysis;
    } catch (error) {
      console.error('Intent analysis error:', error);
      return this.getFallbackAnalysis(message);
    }
  }

  /**
   * Build system prompt for intent analysis
   */
  private buildSystemPrompt(): string {
    return `You are an AI assistant for a luxury e-commerce platform specializing in high-end fashion.
Your task is to analyze user messages and extract structured intents for UI adaptation.

Available intent types:
- greeting: User says hello or initiates conversation
- product_browse: User wants to see products (general browsing)
- product_search: User looking for specific items
- product_detail: User asks about specific product details
- style_advice: User seeks fashion/styling recommendations
- filter_request: User wants to filter or sort products
- brand_story: User interested in brand heritage/craftsmanship
- store_visit: User wants to visit physical store
- appointment: User wants to book styling appointment
- checkout: User ready to purchase
- support: User needs help or has questions

Analyze the message and return a JSON object with:
{
  "intent": {
    "type": "<intent_type>",
    "confidence": <0.0-1.0>
  },
  "entities": {
    "product_type": "<if mentioned>",
    "occasion": "<if mentioned>",
    "color": "<if mentioned>",
    "style": "<if mentioned>",
    "price_range": "<if mentioned>",
    "brand": "<if mentioned>",
    "other": {}
  },
  "context": {
    "urgency": "<low|medium|high>",
    "sentiment": "<positive|neutral|negative>",
    "conversation_stage": "<opening|exploring|deciding|closing>",
    "user_expertise": "<novice|intermediate|expert>"
  },
  "suggested_response": "<brief natural response>",
  "ui_hints": {
    "components_to_show": [],
    "components_to_hide": [],
    "emphasis": "<visual|textual|mixed>"
  }
}`;
  }

  /**
   * Build context messages for better understanding
   */
  private buildContextMessages(): any[] {
    // Include recent conversation history (last 5 messages)
    const recentMessages = this.conversationContext.messages.slice(-5);
    
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Validate and enhance the AI analysis
   */
  private validateAndEnhanceAnalysis(result: any, originalMessage: string): IntentAnalysis {
    // Ensure all required fields exist
    const analysis: IntentAnalysis = {
      intent: {
        type: result.intent?.type || 'unknown',
        confidence: Math.min(Math.max(result.intent?.confidence || 0.5, 0), 1),
        originalMessage
      },
      entities: {
        ...result.entities,
        extractedAt: new Date().toISOString()
      },
      context: {
        urgency: result.context?.urgency || 'medium',
        sentiment: result.context?.sentiment || 'neutral',
        conversationStage: result.context?.conversation_stage || 'exploring',
        userExpertise: result.context?.user_expertise || 'intermediate',
        ...result.context
      },
      suggestedResponse: result.suggested_response || this.getDefaultResponse(result.intent?.type),
      uiHints: {
        componentsToShow: result.ui_hints?.components_to_show || [],
        componentsToHide: result.ui_hints?.components_to_hide || [],
        emphasis: result.ui_hints?.emphasis || 'mixed',
        ...result.ui_hints
      },
      timestamp: new Date().toISOString()
    };

    // Apply confidence boosting rules
    analysis.intent.confidence = this.applyConfidenceRules(analysis);

    return analysis;
  }

  /**
   * Apply rules to adjust confidence based on context
   */
  private applyConfidenceRules(analysis: IntentAnalysis): number {
    let confidence = analysis.intent.confidence;

    // Boost confidence for clear intent indicators
    const intentIndicators: Record<string, string[]> = {
      'product_browse': ['show', 'browse', 'looking for', 'need', 'want'],
      'product_detail': ['tell me about', 'details', 'information', 'how', 'what'],
      'style_advice': ['suggest', 'recommend', 'help me', 'advice', 'match'],
      'store_visit': ['visit', 'store', 'location', 'in person', 'see'],
      'appointment': ['book', 'appointment', 'schedule', 'meet', 'consultation']
    };

    const lowerMessage = analysis.intent.originalMessage.toLowerCase();
    const indicators = intentIndicators[analysis.intent.type] || [];
    
    if (indicators.some(indicator => lowerMessage.includes(indicator))) {
      confidence = Math.min(confidence * 1.2, 0.95);
    }

    // Reduce confidence if message is very short or ambiguous
    if (lowerMessage.split(' ').length < 3) {
      confidence *= 0.8;
    }

    return confidence;
  }

  /**
   * Get fallback analysis for error cases
   */
  private getFallbackAnalysis(message: string): IntentAnalysis {
    return {
      intent: {
        type: 'support',
        confidence: 0.5,
        originalMessage: message
      },
      entities: {},
      context: {
        urgency: 'medium',
        sentiment: 'neutral',
        conversationStage: 'exploring',
        userExpertise: 'intermediate'
      },
      suggestedResponse: "I'm here to help you find the perfect piece. Could you tell me more about what you're looking for?",
      uiHints: {
        componentsToShow: ['ConversationPanel', 'SuggestionCards'],
        componentsToHide: [],
        emphasis: 'textual'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get default response for intent type
   */
  private getDefaultResponse(intentType: string): string {
    const responses: Record<string, string> = {
      'greeting': "Welcome! I'm here to help you discover our latest collection.",
      'product_browse': "Let me show you our curated selection.",
      'product_detail': "I'll provide you with all the details about this piece.",
      'style_advice': "I'd be happy to help you create the perfect look.",
      'store_visit': "I'll help you find the nearest boutique and arrange your visit.",
      'appointment': "Let's schedule your personal styling session.",
      'unknown': "I'm here to assist you. Could you tell me more about what you're looking for?"
    };

    return responses[intentType] || responses['unknown'];
  }

  /**
   * Update user context based on conversation
   */
  updateUserContext(updates: Partial<UserProfile>): void {
    this.conversationContext.userProfile = {
      ...this.conversationContext.userProfile,
      ...updates
    };
  }

  /**
   * Get conversation summary for context
   */
  getConversationSummary(): string {
    const recentIntents = this.conversationContext.messages
      .filter(msg => msg.role === 'assistant' && msg.content.includes('Intent:'))
      .slice(-3)
      .map(msg => msg.content.split(':')[1]?.trim())
      .filter(Boolean);

    return recentIntents.join(' → ');
  }
}

// Type definitions
interface IntentAnalysis {
  intent: {
    type: string;
    confidence: number;
    originalMessage: string;
  };
  entities: Record<string, any>;
  context: {
    urgency: 'low' | 'medium' | 'high';
    sentiment: 'positive' | 'neutral' | 'negative';
    conversationStage: 'opening' | 'exploring' | 'deciding' | 'closing';
    userExpertise: 'novice' | 'intermediate' | 'expert';
    [key: string]: any;
  };
  suggestedResponse: string;
  uiHints: {
    componentsToShow: string[];
    componentsToHide: string[];
    emphasis: 'visual' | 'textual' | 'mixed';
    [key: string]: any;
  };
  timestamp: string;
}

interface ConversationContext {
  messages: ConversationMessage[];
  userProfile: UserProfile;
  sessionData: Record<string, any>;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UserProfile {
  preferences?: Record<string, any>;
  history?: string[];
  expertise?: string;
  [key: string]: any;
}