# Sacsa-Sentinel 🚨

> **AI-Powered Operations Assistant for Developers** - Transform incident response from reactive monitoring to proactive resolution

[![Built with Tambo](https://img.shields.io/badge/Built%20with-Tambo-blue)](https://tambo.ai)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 🎯 Overview

Sacsa-Sentinel is an AI-powered operations assistant that integrates with Sentry, GitHub, and Vercel to provide intelligent incident response. Built with Next.js 15 and Tambo's Generative UI framework, it delivers contextual information through 12 specialized AI-generated components that adapt to your queries.

**Core Value:** Instead of drowning you in dashboards, Sacsa-Sentinel analyzes production errors, identifies root causes, and suggests fixes with actionable buttons - all through natural language conversation.

## ✨ Key Features

### 🤖 Autonomous Incident Commander
- **4-Stage Workflow**: Error Detection → AI Analysis → Root Cause Identification → Action Orchestration
- **Contextual Actions**: Create PR, deploy hotfix, rollback, or investigate with one click
- **Real Stack Traces**: Full error context with file locations and line numbers

### 📊 Live Dashboard
- **Real-Time Metrics**: Error counts, deployment status, GitHub activity
- **Quick Stats**: Sentry errors, deployments, commits at a glance
- **Timeline Correlation**: See how deployments correlate with error spikes

### 💬 AI Chat Interface
- **12 Generative Components**: Dynamic UI that adapts to your questions
- **Thread History**: Maintain context across conversations
- **Natural Language**: Ask questions like "Should I rollback?" and get decision matrices

### 🔌 Production Integrations
- **Sentry**: Live error tracking with severity levels and affected users
- **GitHub**: Commit analysis, diff viewing, and repository insights
- **Vercel**: Deployment monitoring and one-click rollbacks
- **MCP Protocol**: Secure access to external data sources

## 🎨 Components Library

We've built 12 specialized components that render dynamically based on context:

| Component | Purpose | Type |
|-----------|---------|------|
| **IncidentCommander** | Autonomous incident analysis & resolution | Generative |
| **ThreatAlert** | Sentry error monitoring with severity | Generative |
| **FortressDiff** | GitHub commit diff viewer | Generative |
| **TacticalRollback** | Vercel deployment management | Interactable |
| **BattleStats** | System metrics and KPIs | Generative |
| **Timeline** | Chronological event tracking | Generative |
| **Runbook** | Step-by-step troubleshooting guides | Generative |
| **CodeExplainer** | Code analysis and explanations | Generative |
| **DecisionMatrix** | Compare options (e.g., rollback vs hotfix) | Generative |
| **ComparisonMatrix** | Feature or approach comparisons | Generative |
| **QuickStats** | Dashboard metrics card | Generative |
| **MessageWithSuggestions** | AI responses with follow-up prompts | Generative |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/Sacsa-Sentinel.git
cd Sacsa-Sentinel
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp example.env.local .env.local
```

Add your API keys to `.env.local`:

```env
# Required: Tambo API Key
NEXT_PUBLIC_TAMBO_API_KEY=your-tambo-api-key

# Optional: For real API data (works with mock data if not provided)
SENTRY_AUTH_TOKEN=your-sentry-token
SENTRY_ORG=your-org-slug
GITHUB_TOKEN=your-github-token
VERCEL_TOKEN=your-vercel-token
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Explore the App

- **Dashboard**: [http://localhost:3000](http://localhost:3000) - Real-time metrics and quick stats
- **AI Chat**: [http://localhost:3000/chat](http://localhost:3000/chat) - Conversational incident response
- **Components Demo**: [http://localhost:3000/interactables](http://localhost:3000/interactables) - Interactive component testing

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Dashboard with live metrics
│   ├── chat/
│   │   └── page.tsx               # AI chat interface
│   └── interactables/
│       └── page.tsx               # Component testing page
├── components/
│   ├── generative/
│   │   ├── incident-commander.tsx # Autonomous AI incident resolver
│   │   ├── threat-alert.tsx       # Sentry error monitoring
│   │   ├── fortress-diff.tsx      # GitHub diff viewer
│   │   ├── tactical-rollback.tsx  # Vercel deployment control
│   │   ├── battle-stats.tsx       # Metrics dashboard
│   │   ├── timeline.tsx           # Event chronology
│   │   ├── runbook.tsx           # Troubleshooting guides
│   │   ├── code-explainer.tsx    # Code analysis
│   │   ├── decision-matrix.tsx   # Option comparison
│   │   └── comparison-matrix.tsx # Feature comparison
│   └── tambo/
│       ├── message-thread-full.tsx  # Chat interface
│       ├── thread-container.tsx     # Thread management
│       └── markdown-components.tsx  # Message rendering
├── lib/
│   ├── tambo.ts                  # Component registration & config
│   ├── api-clients.ts            # Sentry/GitHub/Vercel integration
│   └── thread-hooks.ts           # Chat state management
└── services/
    └── population-stats.ts       # Demo data service
```

## 🏗️ Architecture

### How Tambo Powers the UI

Sacsa-Sentinel uses **Tambo's Generative UI framework** to dynamically render components based on user intent:

1. **Component Registration**: All 12 components are registered with Tambo, each with Zod schemas for type-safe validation
2. **Intent Analysis**: When you ask "Analyze this error", Tambo's AI determines the best component to render (e.g., IncidentCommander)
3. **Dynamic Props**: Tambo generates component props from real-time API data via MCP integrations
4. **Thread Context**: Conversations maintain state across multiple interactions

### Model Context Protocol (MCP)

MCP bridges AI models with external data sources securely:

- **Sentry MCP**: Fetches errors, stack traces, and affected user counts
- **GitHub MCP**: Retrieves commits, diffs, and repository information
- **Vercel MCP**: Manages deployments and executes rollbacks

This architecture enables the AI to work with **real production data** rather than generating fake examples.

### Data Flow

```
User Query → Tambo AI → Intent Analysis → MCP Tool Call → API Data → Component Render → UI Update
```

## 🎨 Design System

- **Dark Theme**: Optimized for extended debugging sessions
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Responsive**: Mobile-friendly layouts
- **Accessibility**: Semantic HTML and ARIA labels

## 💡 Usage Examples

### Example Prompts

Try these in the chat interface:

```
"Analyze and fix the most critical production error"
"Show me the deployment history and tell me if anything needs rollback"
"Create a step-by-step troubleshooting guide for this error"
"Should I rollback or deploy a hotfix? Compare the options"
"Explain what this code does: [paste code]"
"Show me GitHub commits from the last 24 hours"
```

### Component Selection

The AI automatically chooses the right component:
- **Questions about errors** → ThreatAlert or IncidentCommander
- **"Should I..."** questions → DecisionMatrix
- **Code analysis requests** → CodeExplainer or FortressDiff
- **Timeline/history requests** → Timeline
- **How-to questions** → Runbook

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **[Next.js 15](https://nextjs.org)** | React framework with App Router |
| **[Tambo SDK](https://tambo.ai)** | Generative UI framework |
| **[TypeScript](https://www.typescriptlang.org/)** | Type safety |
| **[Zod](https://zod.dev)** | Schema validation |
| **[Tailwind CSS](https://tailwindcss.com)** | Styling |
| **[Model Context Protocol](https://modelcontextprotocol.io)** | API integrations |
| **[Sentry](https://sentry.io)** | Error tracking |
| **[Vercel](https://vercel.com)** | Deployment platform |

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

1. Click "Deploy" button above
2. Connect your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_TAMBO_API_KEY` (required)
   - Optional: `SENTRY_AUTH_TOKEN`, `GITHUB_TOKEN`, `VERCEL_TOKEN`
4. Deploy!

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions including Azure deployment.

## 🔧 Customization

### Adding New Components

Register components in `src/lib/tambo.ts`:

```typescript
import { TamboComponent } from '@tambohq/tambo';

export const components: TamboComponent[] = [
  {
    name: "MyNewComponent",
    description: "What this component does",
    component: MyNewComponent,
    propsSchema: myComponentSchema, // Zod schema
  },
  // ... other components
];
```

### Adding MCP Tools

Define tools for the AI to use:

```typescript
export const tools: TamboTool[] = [
  {
    name: "myCustomTool",
    description: "Fetches custom data",
    tool: async (input) => {
      // Implementation
      return result;
    },
    inputSchema: z.object({ /* params */ }),
    outputSchema: z.object({ /* return type */ }),
  },
];
```

## 📚 Documentation

- **[VIDEO_SCRIPT.md](VIDEO_SCRIPT.md)** - Demo presentation script
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Deployment instructions (Vercel & Azure)
- **[AZURE_DEPLOYMENT.md](AZURE_DEPLOYMENT.md)** - Detailed Azure setup guide

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- **[Tambo AI](https://tambo.ai)** - For the amazing Generative UI framework
- **[Model Context Protocol](https://modelcontextprotocol.io)** - For enabling secure API integrations
- **Hackathon Team** - For building this in record time!

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/Sacsa-Sentinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/Sacsa-Sentinel/discussions)  
- **Documentation**: [Tambo Docs](https://docs.tambo.ai)

---

**Built with ❤️ for the Tambo Hackathon** | [Live Demo](https://your-demo-url.vercel.app) | [Video Demo](https://your-video-url)
