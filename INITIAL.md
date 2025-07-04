## FEATURE:

Build a **Conversational UI Assembly System** that demonstrates progressive interface construction through natural conversation. The system should showcase the symbiotic paradigm where:

- **OpenAI GPT-4**: Handles intent analysis, component selection, and conversation orchestration
- **React Frontend**: Efficiently renders and animates UI components based on AI decisions
- **FastAPI Backend**: Manages WebSocket connections and AI integration
- **Real-time Updates**: WebSocket enables instant UI transformations

**Demo Scenario**: Luxury e-commerce experience (Prada-style) where:
1. User says "Hi" → Minimal welcome with brand aesthetic
2. "Looking for gallery opening outfit" → Artistic background + curated carousel appears
3. "Prefer minimalist black" → Interface filters + shows design philosophy panel
4. "Like this blazer" → 360° view + craftsmanship details emerge smoothly
5. "How is it made?" → Artisan story + process video slides in
6. "See in person" → Store locator + appointment booking fades in

**Key Technical Requirements**:
- Component registry for dynamic instantiation
- Smooth Framer Motion transitions between states
- Conversation memory persisting across sessions
- Intent confidence scoring and fallback handling
- Responsive design maintaining luxury feel

## EXAMPLES:

The `examples/` folder contains critical patterns for implementation:

- `examples/components/` - Luxury UI components (ProductCard, ConversationPanel, DynamicGrid)
- `examples/assembly/` - Component registry and assembly engine patterns
- `examples/intent/` - OpenAI integration for intent analysis and mapping
- `examples/websocket/` - Real-time communication patterns for UI updates
- `examples/conversation/` - State management and persistence patterns
- `examples/animations/` - Framer Motion transition configurations

Key patterns to follow from examples:
- Component registration mechanism for dynamic loading
- Intent to component mapping with confidence thresholds
- WebSocket message protocol for UI instructions
- Zustand store structure for conversation state
- Animation orchestration for smooth transitions

## DOCUMENTATION:

- **React 18**: https://react.dev/reference/react
- **TypeScript**: https://www.typescriptlang.org/docs/
- **FastAPI WebSocket**: https://fastapi.tiangolo.com/advanced/websockets/
- **OpenAI API**: https://platform.openai.com/docs/api-reference/chat
- **Framer Motion**: https://www.framer.com/motion/animation/
- **Tailwind CSS**: https://tailwindcss.com/docs/utility-first
- **Zustand**: https://docs.pmnd.rs/zustand/getting-started/introduction
- **Storybook**: https://storybook.js.org/docs/react/get-started/introduction

## OTHER CONSIDERATIONS:

- **Performance**: Implement code splitting and lazy loading for components
- **Accessibility**: Ensure ARIA labels update with dynamic content, announce changes
- **Error Handling**: Graceful degradation if OpenAI API fails (use cached intents)
- **Security**: Validate all component selections server-side, sanitize user input
- **Testing**: Mock WebSocket in tests, use MSW for API mocking
- **Rate Limiting**: Implement client-side debouncing and server-side rate limits
- **Deployment**: Consider Vercel for frontend, Railway/Fly.io for backend
- **Environment Variables**: Use .env.example with all required keys documented
- **Monitoring**: Add logging for intent analysis and component assembly decisions
- **Mobile**: Ensure touch-friendly interactions and responsive design