import { ComponentRegistry } from '../assembly/ComponentRegistry';
import { IntentAnalysis } from './IntentAnalyzer';

/**
 * Maps analyzed intents to specific UI components and actions.
 * Determines what components to show/hide based on user intent.
 */
export class IntentMapper {
  private registry: ComponentRegistry;
  private mappingRules: MappingRule[];

  constructor() {
    this.registry = ComponentRegistry.getInstance();
    this.mappingRules = this.initializeMappingRules();
  }

  /**
   * Map intent analysis to UI instructions
   */
  mapToUIInstructions(analysis: IntentAnalysis): UIInstruction {
    // Find matching rules
    const matchingRules = this.mappingRules.filter(rule => 
      this.evaluateRule(rule, analysis)
    );

    if (matchingRules.length === 0) {
      return this.getDefaultInstruction();
    }

    // Merge instructions from all matching rules
    return this.mergeInstructions(matchingRules, analysis);
  }

  /**
   * Initialize mapping rules
   */
  private initializeMappingRules(): MappingRule[] {
    return [
      // Greeting intent
      {
        id: 'greeting_rule',
        condition: (analysis) => 
          analysis.intent.type === 'greeting' && 
          analysis.intent.confidence > 0.7,
        instruction: {
          action: 'add',
          components: [
            {
              type: 'WelcomeHero',
              props: {
                message: 'Welcome to our world of luxury',
                subtitle: 'How may we assist you today?'
              },
              position: { area: 'hero', order: 0 }
            },
            {
              type: 'SuggestionCards',
              props: {
                suggestions: [
                  { text: 'Browse New Arrivals', intent: 'product_browse' },
                  { text: 'Book Styling Session', intent: 'appointment' },
                  { text: 'Explore Collections', intent: 'brand_story' }
                ]
              },
              position: { area: 'main', order: 1 }
            }
          ],
          layout: 'centered',
          animation: {
            enter: 'fadeInUp',
            duration: 0.6,
            stagger: 0.2
          }
        }
      },

      // Product browsing intent
      {
        id: 'browse_rule',
        condition: (analysis) => 
          analysis.intent.type === 'product_browse' && 
          analysis.intent.confidence > 0.6,
        instruction: {
          action: 'add',
          components: [
            {
              type: 'ProductGrid',
              props: (analysis) => ({
                filters: this.extractFilters(analysis.entities),
                initialProducts: 12,
                enableInfiniteScroll: true
              }),
              position: { area: 'main', order: 0 }
            },
            {
              type: 'FilterPanel',
              props: (analysis) => ({
                availableFilters: this.getAvailableFilters(analysis.entities),
                activeFilters: this.extractFilters(analysis.entities),
                position: 'sidebar'
              }),
              position: { area: 'sidebar', order: 0 }
            }
          ],
          layout: 'two-column',
          animation: {
            enter: 'slideIn',
            duration: 0.5
          }
        }
      },

      // Product detail intent
      {
        id: 'detail_rule',
        condition: (analysis) => 
          analysis.intent.type === 'product_detail' && 
          analysis.entities.productId,
        instruction: {
          action: 'add',
          components: [
            {
              type: 'ProductDetailView',
              props: (analysis) => ({
                productId: analysis.entities.productId,
                showCraftsmanship: true,
                enable360View: true
              }),
              position: { area: 'main', order: 0 }
            },
            {
              type: 'RelatedProducts',
              props: (analysis) => ({
                productId: analysis.entities.productId,
                maxItems: 4
              }),
              position: { area: 'bottom', order: 1 }
            }
          ],
          layout: 'full-width',
          animation: {
            enter: 'fadeIn',
            duration: 0.4
          }
        }
      },

      // Style advice intent
      {
        id: 'style_advice_rule',
        condition: (analysis) => 
          analysis.intent.type === 'style_advice',
        instruction: {
          action: 'add',
          components: [
            {
              type: 'StyleAdvisor',
              props: (analysis) => ({
                occasion: analysis.entities.occasion,
                preferences: analysis.entities,
                mode: 'interactive'
              }),
              position: { area: 'main', order: 0 }
            },
            {
              type: 'OutfitBuilder',
              props: {
                allowMixMatch: true,
                showPricing: true
              },
              position: { area: 'sidebar', order: 0 }
            }
          ],
          layout: 'split-view',
          animation: {
            enter: 'slideInFromRight',
            duration: 0.5
          }
        }
      },

      // Store visit intent
      {
        id: 'store_visit_rule',
        condition: (analysis) => 
          analysis.intent.type === 'store_visit',
        instruction: {
          action: 'add',
          components: [
            {
              type: 'StoreLocator',
              props: {
                showMap: true,
                enableGeolocation: true
              },
              position: { area: 'main', order: 0 }
            },
            {
              type: 'AppointmentScheduler',
              props: {
                serviceTypes: ['personal-shopping', 'styling-consultation'],
                showAvailability: true
              },
              position: { area: 'sidebar', order: 0 }
            }
          ],
          layout: 'map-view',
          animation: {
            enter: 'expandFromCenter',
            duration: 0.6
          }
        }
      },

      // High confidence context rules
      {
        id: 'urgency_modifier',
        condition: (analysis) => 
          analysis.context.urgency === 'high' &&
          analysis.intent.confidence > 0.8,
        instruction: {
          action: 'modify',
          modifications: {
            animation: {
              duration: 0.3,
              enter: 'instant'
            },
            props: {
              priority: 'high',
              showQuickActions: true
            }
          }
        }
      }
    ];
  }

  /**
   * Evaluate if a rule matches the analysis
   */
  private evaluateRule(rule: MappingRule, analysis: IntentAnalysis): boolean {
    try {
      return rule.condition(analysis);
    } catch (error) {
      console.error(`Error evaluating rule ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * Merge instructions from multiple rules
   */
  private mergeInstructions(rules: MappingRule[], analysis: IntentAnalysis): UIInstruction {
    const baseInstruction: UIInstruction = {
      action: 'add',
      components: [],
      layout: 'default',
      animation: {
        enter: 'fadeIn',
        exit: 'fadeOut',
        duration: 0.5
      }
    };

    // Merge all instructions
    rules.forEach(rule => {
      const instruction = rule.instruction;
      
      if (instruction.action === 'modify') {
        // Apply modifications
        Object.assign(baseInstruction, instruction.modifications);
      } else {
        // Add components
        if (instruction.components) {
          instruction.components.forEach(comp => {
            const props = typeof comp.props === 'function' 
              ? comp.props(analysis) 
              : comp.props;
              
            baseInstruction.components!.push({
              id: `${comp.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: comp.type,
              props,
              position: comp.position,
              animationDelay: baseInstruction.components!.length * 0.1
            });
          });
        }

        // Override layout and animation if specified
        if (instruction.layout) {
          baseInstruction.layout = instruction.layout;
        }
        if (instruction.animation) {
          baseInstruction.animation = { ...baseInstruction.animation, ...instruction.animation };
        }
      }
    });

    return baseInstruction;
  }

  /**
   * Extract filters from entities
   */
  private extractFilters(entities: Record<string, any>): Record<string, any> {
    const filters: Record<string, any> = {};
    
    if (entities.color) filters.color = entities.color;
    if (entities.product_type) filters.category = entities.product_type;
    if (entities.occasion) filters.occasion = entities.occasion;
    if (entities.price_range) filters.priceRange = entities.price_range;
    if (entities.style) filters.style = entities.style;
    
    return filters;
  }

  /**
   * Get available filters based on context
   */
  private getAvailableFilters(entities: Record<string, any>): string[] {
    const allFilters = ['category', 'color', 'size', 'price', 'occasion', 'style', 'material'];
    
    // Prioritize filters based on what user mentioned
    const mentionedFilters = Object.keys(this.extractFilters(entities));
    const otherFilters = allFilters.filter(f => !mentionedFilters.includes(f));
    
    return [...mentionedFilters, ...otherFilters];
  }

  /**
   * Get default instruction for unknown intents
   */
  private getDefaultInstruction(): UIInstruction {
    return {
      action: 'add',
      components: [
        {
          id: `help-${Date.now()}`,
          type: 'HelpPanel',
          props: {
            message: "I'm here to help. What would you like to explore?",
            showSuggestions: true
          },
          position: { area: 'main', order: 0 }
        }
      ],
      layout: 'centered',
      animation: {
        enter: 'fadeIn',
        exit: 'fadeOut',
        duration: 0.3
      }
    };
  }
}

// Type definitions
interface MappingRule {
  id: string;
  condition: (analysis: IntentAnalysis) => boolean;
  instruction: RuleInstruction;
}

interface RuleInstruction {
  action: 'add' | 'remove' | 'modify';
  components?: ComponentDefinition[];
  layout?: string;
  animation?: AnimationConfig;
  modifications?: Record<string, any>;
}

interface ComponentDefinition {
  type: string;
  props: Record<string, any> | ((analysis: IntentAnalysis) => Record<string, any>);
  position: {
    area: string;
    order: number;
  };
}

interface UIInstruction {
  action: string;
  components?: ComponentInstance[];
  layout: string;
  animation: AnimationConfig;
  priority?: string;
}

interface ComponentInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  position: {
    area: string;
    order: number;
  };
  animationDelay?: number;
}

interface AnimationConfig {
  enter: string;
  exit: string;
  duration: number;
  stagger?: number;
}