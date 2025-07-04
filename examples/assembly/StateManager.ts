import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global state manager for the assembly system.
 * Manages UI state, conversation context, and component lifecycle.
 */

interface AssemblyStore {
  // UI State
  activeComponents: ComponentInstance[];
  layout: string;
  theme: 'light' | 'dark';
  
  // Conversation Context
  conversationId: string;
  userContext: UserContext;
  intentHistory: Intent[];
  
  // Actions
  addComponents: (components: ComponentInstance[]) => void;
  removeComponents: (componentIds: string[]) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  setLayout: (layout: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateUserContext: (updates: Partial<UserContext>) => void;
  addIntent: (intent: Intent) => void;
  reset: () => void;
}

export const useAssemblyStore = create<AssemblyStore>(
  persist(
    (set, get) => ({
      // Initial state
      activeComponents: [],
      layout: 'default',
      theme: 'light',
      conversationId: generateConversationId(),
      userContext: {
        preferences: {},
        history: [],
        metadata: {}
      },
      intentHistory: [],

      // Actions
      addComponents: (components) => set((state) => ({
        activeComponents: [...state.activeComponents, ...components]
      })),

      removeComponents: (componentIds) => set((state) => ({
        activeComponents: state.activeComponents.filter(
          c => !componentIds.includes(c.id)
        )
      })),

      updateComponent: (id, updates) => set((state) => ({
        activeComponents: state.activeComponents.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      })),

      setLayout: (layout) => set({ layout }),

      setTheme: (theme) => set({ theme }),

      updateUserContext: (updates) => set((state) => ({
        userContext: {
          ...state.userContext,
          ...updates,
          preferences: {
            ...state.userContext.preferences,
            ...updates.preferences
          }
        }
      })),

      addIntent: (intent) => set((state) => ({
        intentHistory: [...state.intentHistory, intent],
        userContext: {
          ...state.userContext,
          lastIntent: intent
        }
      })),

      reset: () => set({
        activeComponents: [],
        layout: 'default',
        theme: 'light',
        conversationId: generateConversationId(),
        userContext: {
          preferences: {},
          history: [],
          metadata: {}
        },
        intentHistory: []
      })
    }),
    {
      name: 'assembly-store',
      partialize: (state) => ({
        userContext: state.userContext,
        theme: state.theme
      })
    }
  )
);

/**
 * Derived selectors for common queries
 */
export const assemblySelectors = {
  getComponentById: (id: string) => (state: AssemblyStore) => 
    state.activeComponents.find(c => c.id === id),
    
  getComponentsByType: (type: string) => (state: AssemblyStore) =>
    state.activeComponents.filter(c => c.type === type),
    
  hasComponent: (type: string) => (state: AssemblyStore) =>
    state.activeComponents.some(c => c.type === type),
    
  getLastIntent: () => (state: AssemblyStore) =>
    state.intentHistory[state.intentHistory.length - 1],
    
  getUserPreference: (key: string) => (state: AssemblyStore) =>
    state.userContext.preferences[key]
};

/**
 * Utility functions
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Type definitions
interface ComponentInstance {
  id: string;
  type: string;
  props: Record<string, any>;
  position: {
    area?: string;
    order: number;
  };
  metadata?: {
    addedAt: number;
    addedByIntent?: string;
  };
}

interface UserContext {
  preferences: Record<string, any>;
  history: string[];
  metadata: Record<string, any>;
  lastIntent?: Intent;
}

interface Intent {
  id: string;
  type: string;
  confidence: number;
  entities?: Record<string, any>;
  timestamp: number;
}