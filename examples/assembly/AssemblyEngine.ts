import { ComponentRegistry } from './ComponentRegistry';
import { AnimationOrchestrator } from '../animations/AnimationOrchestrator';

/**
 * Assembly Engine orchestrates the dynamic construction of UI based on intents.
 * It manages component lifecycle, positioning, and animations.
 */
export class AssemblyEngine {
  private registry: ComponentRegistry;
  private animationOrchestrator: AnimationOrchestrator;
  private activeComponents: Map<string, ComponentState> = new Map();
  private layoutEngine: LayoutEngine;
  private updateCallback?: (state: AssemblyState) => void;

  constructor() {
    this.registry = ComponentRegistry.getInstance();
    this.animationOrchestrator = new AnimationOrchestrator();
    this.layoutEngine = new LayoutEngine();
  }

  /**
   * Process UI instruction and update component state
   */
  async processInstruction(instruction: UIInstruction): Promise<void> {
    console.log('Processing UI instruction:', instruction);
    
    try {
      switch (instruction.action) {
        case 'add':
          await this.addComponents(instruction.components, instruction.animation);
          break;
        case 'remove':
          await this.removeComponents(instruction.componentIds, instruction.animation);
          break;
        case 'update':
          await this.updateComponents(instruction.updates);
          break;
        case 'reorganize':
          await this.reorganizeLayout(instruction.layout);
          break;
        default:
          console.warn('Unknown instruction action:', instruction.action);
      }

      // Notify about state change
      this.notifyUpdate();
    } catch (error) {
      console.error('Error processing instruction:', error);
      throw error;
    }
  }

  /**
   * Add components with animation
   */
  private async addComponents(
    components: ComponentInstance[], 
    animationConfig?: AnimationConfig
  ): Promise<void> {
    const animationPromises: Promise<void>[] = [];

    for (const component of components) {
      // Check if component is registered
      if (!this.registry.has(component.type)) {
        console.warn(`Component ${component.type} not registered`);
        continue;
      }

      // Create component state
      const state: ComponentState = {
        ...component,
        status: 'mounting',
        mountedAt: Date.now()
      };

      this.activeComponents.set(component.id, state);

      // Schedule animation
      if (animationConfig) {
        const animPromise = this.animationOrchestrator.animateIn(
          component.id,
          animationConfig,
          component.animationDelay
        );
        animationPromises.push(animPromise);
      }
    }

    // Wait for all animations to complete
    await Promise.all(animationPromises);

    // Update component states
    components.forEach(component => {
      const state = this.activeComponents.get(component.id);
      if (state) {
        state.status = 'mounted';
      }
    });
  }

  /**
   * Remove components with animation
   */
  private async removeComponents(
    componentIds: string[], 
    animationConfig?: AnimationConfig
  ): Promise<void> {
    const animationPromises: Promise<void>[] = [];

    for (const id of componentIds) {
      const component = this.activeComponents.get(id);
      if (!component) continue;

      // Update status
      component.status = 'unmounting';

      // Schedule animation
      if (animationConfig) {
        const animPromise = this.animationOrchestrator.animateOut(
          id,
          animationConfig
        ).then(() => {
          this.activeComponents.delete(id);
        });
        animationPromises.push(animPromise);
      } else {
        this.activeComponents.delete(id);
      }
    }

    await Promise.all(animationPromises);
  }

  /**
   * Update component props
   */
  private async updateComponents(updates: ComponentUpdate[]): Promise<void> {
    for (const update of updates) {
      const component = this.activeComponents.get(update.id);
      if (!component) continue;

      // Merge props
      component.props = {
        ...component.props,
        ...update.props
      };

      // Update position if provided
      if (update.position) {
        component.position = {
          ...component.position,
          ...update.position
        };
      }
    }
  }

  /**
   * Reorganize layout with smooth transitions
   */
  private async reorganizeLayout(newLayout: string): Promise<void> {
    const positions = this.layoutEngine.calculatePositions(
      Array.from(this.activeComponents.values()),
      newLayout
    );

    // Update positions
    positions.forEach((position, componentId) => {
      const component = this.activeComponents.get(componentId);
      if (component) {
        component.position = position;
      }
    });

    // Animate layout change
    await this.animationOrchestrator.animateLayoutChange(
      Array.from(this.activeComponents.keys())
    );
  }

  /**
   * Get current assembly state
   */
  getState(): AssemblyState {
    return {
      components: Array.from(this.activeComponents.values()),
      layout: this.layoutEngine.getCurrentLayout(),
      timestamp: Date.now()
    };
  }

  /**
   * Subscribe to state updates
   */
  onUpdate(callback: (state: AssemblyState) => void): void {
    this.updateCallback = callback;
  }

  /**
   * Notify subscribers about state change
   */
  private notifyUpdate(): void {
    if (this.updateCallback) {
      this.updateCallback(this.getState());
    }
  }

  /**
   * Clear all components
   */
  async clear(): Promise<void> {
    const ids = Array.from(this.activeComponents.keys());
    await this.removeComponents(ids, {
      enter: 'fadeOut',
      exit: 'fadeOut',
      duration: 0.3
    });
  }
}

/**
 * Layout Engine calculates component positions
 */
class LayoutEngine {
  private currentLayout: string = 'default';

  calculatePositions(
    components: ComponentState[], 
    layout: string
  ): Map<string, Position> {
    const positions = new Map<string, Position>();
    
    switch (layout) {
      case 'centered':
        components.forEach((component, index) => {
          positions.set(component.id, {
            area: 'center',
            order: index,
            width: '100%',
            maxWidth: '600px'
          });
        });
        break;

      case 'two-column':
        const sidebarComponents = components.filter(c => 
          ['FilterPanel', 'NavigationPanel'].includes(c.type)
        );
        const mainComponents = components.filter(c => 
          !['FilterPanel', 'NavigationPanel'].includes(c.type)
        );

        sidebarComponents.forEach((component, index) => {
          positions.set(component.id, {
            area: 'sidebar',
            order: index,
            width: '300px'
          });
        });

        mainComponents.forEach((component, index) => {
          positions.set(component.id, {
            area: 'main',
            order: index,
            width: '100%'
          });
        });
        break;

      case 'grid':
        components.forEach((component, index) => {
          positions.set(component.id, {
            area: 'grid',
            order: index,
            width: 'auto',
            gridColumn: (index % 3) + 1,
            gridRow: Math.floor(index / 3) + 1
          });
        });
        break;

      default:
        components.forEach((component, index) => {
          positions.set(component.id, {
            area: 'main',
            order: index,
            width: '100%'
          });
        });
    }

    this.currentLayout = layout;
    return positions;
  }

  getCurrentLayout(): string {
    return this.currentLayout;
  }
}

// Type definitions
interface ComponentState extends ComponentInstance {
  status: 'mounting' | 'mounted' | 'unmounting';
  mountedAt: number;
}

interface UIInstruction {
  action: 'add' | 'remove' | 'update' | 'reorganize';
  components?: ComponentInstance[];
  componentIds?: string[];
  updates?: ComponentUpdate[];
  layout?: string;
  animation?: AnimationConfig;
}

interface ComponentUpdate {
  id: string;
  props?: Record<string, any>;
  position?: Partial<Position>;
}

interface Position {
  area: string;
  order: number;
  width?: string;
  maxWidth?: string;
  gridColumn?: number;
  gridRow?: number;
}

interface AssemblyState {
  components: ComponentState[];
  layout: string;
  timestamp: number;
}

interface ComponentInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  position: Position;
  animationDelay?: number;
}

interface AnimationConfig {
  enter: string;
  exit: string;
  duration: number;
  stagger?: number;
  ease?: number[];
}