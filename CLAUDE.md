### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start to understand the Conversational UI Assembly architecture
- **Check `TASK.md`** before starting new tasks and update it as you work
- **Follow the symbiotic paradigm**: LLM handles intent/orchestration, browser handles rendering
- **Use consistent naming conventions** for components and API endpoints

### 🧱 Code Structure & Modularity
- **Frontend Components**: Keep React components under 300 lines
- **Organize by feature**:
  ```
  src/
  ├── components/        # Reusable UI components
  ├── assembly/         # Dynamic assembly engine
  ├── intent/          # Intent analysis system  
  ├── conversation/    # Conversation management
  └── websocket/       # Real-time communication
  ```
- **Backend Structure**:
  ```
  backend/
  ├── api/            # FastAPI routes
  ├── intent/         # AI intent analysis
  ├── orchestration/  # Component selection logic
  ├── websocket/      # WebSocket handlers
  └── models/         # Pydantic models
  ```
- **Use python-dotenv and load_dotenv()** for environment variables
- **Use TypeScript** for all frontend code with strict type checking

### 🎨 UI Assembly Principles
- **Progressive Enhancement**: Start minimal, add complexity based on conversation
- **Component Registry**: All components must register with assembly engine
- **State Persistence**: Conversation state must persist across reconnections
- **Animation Standards**: Use Framer Motion for all transitions with spring physics
- **Luxury Aesthetic**: Maintain Prada-like minimalism and elegance

### 🧪 Testing Requirements
- **Component Tests**: Each UI component needs visual regression tests with Storybook
- **Intent Tests**: Mock conversations to test intent analysis
- **Assembly Tests**: Test component selection logic with various intents
- **E2E Tests**: Full conversation flows with Playwright
- **WebSocket Tests**: Test real-time communication and reconnection
- **Always create tests** in the `/tests` folder mirroring the source structure

### ✅ Technical Standards
- **Frontend**: React 18+, TypeScript, Tailwind CSS, Framer Motion, Zustand
- **Backend**: FastAPI, Pydantic v2, WebSockets, python-asyncio
- **AI Integration**: Use OpenAI API for intent analysis (gpt-4o-mini for speed)
- **Real-time**: WebSocket for bi-directional communication
- **Styling**: Tailwind with custom luxury theme configuration

### 📚 Documentation & Comments
- **Document intent mappings** in `docs/intent-mapping.md`
- **Component catalog** in Storybook with usage examples
- **Assembly rules** in `docs/assembly-rules.md`
- **API documentation** using FastAPI's automatic OpenAPI generation
- **Inline comments** for complex assembly logic
- **README updates** when adding new features or changing setup

### 🧠 AI Behavior Rules
- **Never assume missing context** - ask for clarification
- **Follow existing patterns** from the examples/ folder
- **Test incrementally** - validate each component before moving on
- **Use OpenAI API** correctly with proper error handling and retries
- **Respect rate limits** with exponential backoff
- **Log all intent analysis** for debugging and improvement

### 🚀 Performance Considerations
- **Lazy load components** using React.lazy and Suspense
- **Optimize bundle size** with code splitting
- **Cache component manifests** to reduce API calls
- **Debounce user input** before sending to intent analysis
- **Use WebSocket heartbeat** to maintain connection
- **Implement virtual scrolling** for large product catalogs