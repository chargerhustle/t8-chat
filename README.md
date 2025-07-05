# AI Chat

A fast and intelligent AI chat application built with Next.js, React Router, and Convex, providing quick responses and a seamless user experience with multiple AI provider support.

![AI Chat](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Features

### Core Functionality

- **Real-time Chat Interface** - Instant messaging with AI models
- **Multi-Provider AI Support** - OpenAI, Google, Anthropic, and OpenRouter integration
- **Thread Management** - Organize conversations with pinned and archived threads
- **User Authentication** - Secure authentication with Google OAuth
- **File Attachments** - Support for images, PDFs, and documents

### Advanced Capabilities

- **AI Reasoning Models** - Support for o3-mini and o4-mini reasoning models with effort control
- **Memory System** - Persistent AI memory for personalized conversations
- **Search Integration** - Web search capabilities via Exa integration
- **Tool Calling** - Extensible toolkit system for enhanced AI capabilities
- **Streaming Responses** - Real-time message streaming for immediate feedback

### User Experience

- **Keyboard Shortcuts** - Efficient navigation and interaction
- **Message Export** - Export conversations for external use
- **Settings Customization** - Personalize AI behavior and preferences

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, React Router 7
- **Backend**: Convex (real-time database and serverless functions)
- **Authentication**: Convex Auth with Google OAuth
- **AI Integration**: Vercel AI SDK for multiple providers
- **Styling**: Tailwind, shadcn
- **File Storage**: Cloudflare R2 integration
- **State Management**: Zustand for client state

## 📋 Prerequisites

- Node.js 18.17 or later
- A Convex account (sign up at [convex.dev](https://convex.dev))
- API keys for desired AI providers (OpenAI, Google, Anthropic, etc.)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/chargerhustle/t8-chat.git
cd t8-chat
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

### 3. Set Up Convex

```bash
npx convex dev
```

This will:

- Create a new Convex project (if needed)
- Set up your development environment
- Deploy your backend functions

### 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment-url
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Authentication (optional - for Google OAuth)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# AI Provider API Keys (add as needed)
OPENAI_API_KEY=your-openai-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: Search Integration
EXA_API_KEY=your-exa-api-key

# Optional: File Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 🔧 Configuration

### AI Models

The application supports multiple AI providers and models. Configure available models in `src/ai/models-config.ts`:

- **OpenAI**: GPT-4.1, GPT-4o, o3-mini, o4-mini (reasoning models) and more
- **Google**: Gemini Pro, Gemini Flash
- **Anthropic**: Claude 4 Sonnet, Claude 3.7 Sonnet, etc.
- **OpenRouter**: Access to various third-party models (xAI, Grok, etc.)

### Toolkits

Extend AI capabilities with built-in toolkits:

- **Memory Toolkit**: Save, update, and retrieve conversation memories
- **Search Toolkit**: Web search integration via Exa
- **Custom Toolkits**: Create your own tools in `src/toolkits/`

### Authentication

Configure authentication providers in `convex/auth.config.ts`. Currently supports:

- Google OAuth
- Extensible for additional options - GitHub, Magic Links, OTP, email&password etc.

## 📱 Usage

### Starting a Conversation

1. Navigate to the homepage
2. Click "New Chat" or use the keyboard shortcut `Cmd/Ctrl + O`
3. Select your preferred AI model
4. Start typing your message

### Managing Threads

- **Pin Important Conversations**: Click the pin icon to keep threads at the top
- **Archive Old Threads**: Move conversations to archive to declutter
- **Search Threads**: Use `Cmd/Ctrl + K` to search through conversation history
- **Branching**: Branch thread from specific assistant message

### File Attachments

- Drag and drop files onto the chat input
- Supports images (PNG, JPEG, WebP), PDFs, will support more file types in the future

### Memory System

- Enable memory in Settings > Customization
- AI will remember important information across conversations
- Manage memories in Settings > Customization

## 🏗️ Project Structure

```
t8-chat/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── frontend/            # Client-side routing
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   ├── ai/                  # AI configuration
│   └── toolkits/            # AI tool extensions
├── convex/                  # Backend functions and schema
├── public/                  # Static assets
└── styles/                  # Global styles
```

## 🔌 API Routes

The application exposes several API endpoints:

- `POST /api/chat` - Main chat endpoint for AI interactions
- `POST /api/chat/resume` - Resume interrupted chat sessions
- Various Convex functions for data management

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables in Vercel dashboard
4. Deploy your Convex backend: `npx convex deploy`

### Environment Setup

Ensure all environment variables are properly configured in your deployment platform:

- Convex deployment URL
- API keys for AI providers
- Authentication credentials
- File storage configuration

## 📝 License

This project is licensed under the [LICENSE](LICENSE) file in the repository.

## 🙏 Acknowledgments

- [Convex](https://convex.dev) for the real-time backend infrastructure (best db btw)
- [Vercel AI SDK](https://sdk.vercel.ai) for AI provider integrations (best way to use AI)
- [Toolkit](https://github.com/jasonhedman/toolkit.dev) shotout to jasonhedman for toolkit way of tools for AI

## 📞 Support

Twitter: [@chargersh](https://x.com/chargersh)

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/chargerhustle">chargerhustle</a>
</p>
