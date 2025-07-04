/**
 * Component Registry for dynamic component instantiation.
 * This pattern allows components to be loaded and rendered based on AI decisions.
 */

type ComponentType = React.ComponentType<any>;

export class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components = new Map<string, ComponentType>();
  private metadata = new Map<string, ComponentMetadata>();

  private constructor() {}

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * Register a component with optional metadata
   */
  register(
    name: string, 
    component: ComponentType, 
    metadata?: ComponentMetadata
  ): void {
    this.components.set(name, component);
    if (metadata) {
      this.metadata.set(name, metadata);
    }
  }

  /**
   * Get a component by name
   */
  get(name: string): ComponentType | undefined {
    return this.components.get(name);
  }

  /**
   * Get component metadata
   */
  getMetadata(name: string): ComponentMetadata | undefined {
    return this.metadata.get(name);
  }

  /**
   * Check if component exists
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Get all registered component names
   */
  getComponentNames(): string[] {
    return Array.from(this.components.keys());
  }

  /**
   * Map intent to components based on rules
   */
  mapIntentToComponents(intent: Intent): ComponentManifest {
    const mapping = this.getIntentMapping();
    const config = mapping[intent.type];
    
    if (!config) {
      return this.getDefaultManifest();
    }

    // Build manifest based on intent confidence and context
    const components = this.selectComponentsForIntent(intent, config);
    const layout = this.determineLayout(components, intent.context);
    const animations = this.getAnimationConfig(intent.confidence);

    return {
      action: 'add_components',
      components,
      layout,
      animations,
      priority: intent.confidence > 0.8 ? 'high' : 'normal'
    };
  }

  /**
   * Intent to component mapping rules
   */
  private getIntentMapping(): IntentMapping {
    return {
      'greeting': {
        components: ['ConversationPanel'],
        layout: 'centered',
        minConfidence: 0.5
      },
      'product_browse': {
        components: ['ProductGrid', 'FilterPanel'],
        layout: 'two-column',
        minConfidence: 0.7,
        contextual: {
          'with_preferences': ['PersonalizedRecommendations'],
          'luxury_focus': ['BrandStoryPanel']
        }
      },
      'product_detail': {
        components: ['DetailView', 'MediaCarousel', 'CraftsmanshipStory'],
        layout: 'full-width',
        minConfidence: 0.8
      },
      'style_advice': {
        components: ['StyleGuide', 'OutfitBuilder', 'ConversationPanel'],
        layout: 'three-panel',
        minConfidence: 0.75
      },
      'store_visit': {
        components: ['StoreLocator', 'AppointmentScheduler', 'VirtualTour'],
        layout: 'split-view',
        minConfidence: 0.8
      }
    };
  }

  /**
   * Select components based on intent and context
   */
  private selectComponentsForIntent(
    intent: Intent, 
    config: IntentConfig
  ): ComponentInstance[] {
    const components: ComponentInstance[] = [];
    
    // Add base components
    config.components.forEach((componentName, index) => {
      components.push({
        id: `${componentName}-${Date.now()}-${index}`,
        type: componentName,
        props: this.getPropsForComponent(componentName, intent),
        position: { order: index },
        animationDelay: index * 0.1
      });
    });

    // Add contextual components
    if (config.contextual && intent.context) {
      Object.entries(config.contextual).forEach(([contextKey, contextComponents]) => {
        if (intent.context[contextKey]) {
          contextComponents.forEach((componentName, index) => {
            components.push({
              id: `${componentName}-${Date.now()}-ctx-${index}`,
              type: componentName,
              props: this.getPropsForComponent(componentName, intent),
              position: { order: components.length + index },
              animationDelay: (components.length + index) * 0.1
            });
          });
        }
      });
    }

    return components;
  }

  /**
   * Generate props for a component based on intent
   */
  private getPropsForComponent(componentName: string, intent: Intent): any {
    // Component-specific prop generation
    const propGenerators: Record<string, (intent: Intent) => any> = {
      'ProductGrid': (intent) => ({
        filters: intent.entities?.filters || {},
        sortBy: intent.entities?.sortPreference || 'featured',
        itemsPerPage: 12
      }),
      'FilterPanel': (intent) => ({
        availableFilters: ['category', 'color', 'size', 'price'],
        activeFilters: intent.entities?.filters || {},
        position: 'sidebar'
      }),
      'DetailView': (intent) => ({
        productId: intent.entities?.productId,
        showCraftsmanship: true,
        enable360View: true
      })
    };

    const generator = propGenerators[componentName];
    return generator ? generator(intent) : {};
  }

  /**
   * Determine layout based on components and context
   */
  private determineLayout(components: ComponentInstance[], context?: any): string {
    const componentCount = components.length;
    const hasFilters = components.some(c => c.type === 'FilterPanel');
    const hasDetail = components.some(c => c.type === 'DetailView');

    if (hasDetail) return 'full-width';
    if (hasFilters && componentCount > 1) return 'two-column';
    if (componentCount === 1) return 'centered';
    if (componentCount > 3) return 'grid';
    
    return 'default';
  }

  /**
   * Get animation configuration based on confidence
   */
  private getAnimationConfig(confidence: number): AnimationConfig {
    return {
      enter: confidence > 0.8 ? 'fadeInUp' : 'fadeIn',
      exit: 'fadeOut',
      duration: confidence > 0.8 ? 0.5 : 0.3,
      stagger: 0.1,
      ease: [0.25, 0.1, 0.25, 1]
    };
  }

  /**
   * Get default manifest for unknown intents
   */
  private getDefaultManifest(): ComponentManifest {
    return {
      action: 'add_components',
      components: [{
        id: `conversation-${Date.now()}`,
        type: 'ConversationPanel',
        props: { 
          suggestions: [
            'Show me evening wear',
            'I need an outfit for a gallery opening',
            'What\'s new this season?'
          ]
        },
        position: { order: 0 },
        animationDelay: 0
      }],
      layout: 'centered',
      animations: {
        enter: 'fadeIn',
        exit: 'fadeOut',
        duration: 0.3
      }
    };
  }
}

// Type definitions
interface ComponentMetadata {
  category: 'display' | 'input' | 'layout' | 'feedback';
  description: string;
  requiredProps?: string[];
  optionalProps?: string[];
}

interface Intent {
  type: string;
  confidence: number;
  entities?: Record<string, any>;
  context?: Record<string, any>;
}

interface ComponentInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  position: {
    area?: string;
    order: number;
  };
  animationDelay?: number;
}

interface ComponentManifest {
  action: string;
  components: ComponentInstance[];
  layout: string;
  animations: AnimationConfig;
  priority?: 'high' | 'normal' | 'low';
}

interface AnimationConfig {
  enter: string;
  exit: string;
  duration: number;
  stagger?: number;
  ease?: number[];
}

interface IntentConfig {
  components: string[];
  layout: string;
  minConfidence: number;
  contextual?: Record<string, string[]>;
}

type IntentMapping = Record<string, IntentConfig>;

// Global instance for browser
if (typeof window !== 'undefined') {
  (window as any).ComponentRegistry = ComponentRegistry.getInstance();
}