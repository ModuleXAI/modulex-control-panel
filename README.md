# ModuleX Control Panel

A modern, professional admin dashboard for managing ModuleX backend integrations and monitoring system statistics.

## 🚀 Features

- **Modern UI**: Built with Next.js 14+, shadcn/ui, and Tailwind CSS
- **Authentication**: X-API-KEY based authentication with ModuleX backend
- **Tool Management**: Complete CRUD operations for integrations and tools
- **Dashboard**: Real-time statistics and system health monitoring
- **Responsive Design**: Mobile-first approach with professional layouts
- **Docker Support**: Production-ready containerization
- **TypeScript**: Full type safety with strict configuration
- **State Management**: Zustand for lightweight state management
- **Data Fetching**: TanStack Query for efficient API state management

## 🛠️ Technology Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, React 18
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query for API state management
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Containerization**: Docker with multi-stage builds

## 📁 Project Structure

```
modulex-control-panel/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── forms/             # Form components
│   │   └── providers/         # Context providers
│   ├── lib/
│   │   ├── api-client.ts      # API client
│   │   ├── schemas.ts         # Zod schemas
│   │   └── utils.ts           # Utility functions
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript definitions
│   └── middleware.ts          # Route protection
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose
└── next.config.js            # Next.js configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm
- Docker (optional, for containerization)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd modulex-control-panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=https://your-modulex-instance.com
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Setup

### Development with Docker

```bash
# Run development environment
npm run docker:dev
```

### Production with Docker

```bash
# Build and run production container
npm run docker:prod
```

### Manual Docker Commands

```bash
# Build the image
docker build -t modulex-control-panel .

# Run the container
docker run -p 3000:3000 modulex-control-panel
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container
- `npm run docker:dev` - Run development with Docker
- `npm run docker:prod` - Run production with Docker

## 🔐 Authentication

The control panel uses X-API-KEY authentication with your ModuleX backend:

1. Navigate to the login page
2. Enter your ModuleX Host Address (e.g., `https://your-instance.com`)
3. Enter your X-API-KEY
4. Click "Connect" to authenticate

## 📊 Dashboard Features

### Statistics Overview
- Total Users and Active Users
- Integration counts and status
- API call statistics
- System health monitoring

### Tool Management
- Browse available integrations
- Install/uninstall tools
- Configure tool settings
- Search and filter tools by category

### Settings
- General configuration
- API settings
- Security options

## 🎨 UI Components

The project uses shadcn/ui components with Tailwind CSS:

- **Cards**: Statistical displays and content containers
- **Forms**: Authentication and configuration forms
- **Navigation**: Sidebar and responsive navigation
- **Buttons**: Various styles and states
- **Badges**: Status indicators and labels
- **Dialogs**: Modal interactions
- **Tables**: Data display and management

## 🧪 Development

### Adding New Components

1. Create component in appropriate directory
2. Add to exports if needed
3. Update TypeScript types
4. Add to documentation

### API Integration

The API client is configured to work with ModuleX backend:

- Authentication via X-API-KEY header
- Automatic error handling
- Type-safe responses
- Request/response interceptors

### State Management

- **Auth Store**: User authentication state
- **UI Store**: Interface state (sidebar, theme)
- **Query Cache**: API data caching via TanStack Query

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | ModuleX backend URL | `https://api.modulex.com` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Authentication secret | - |
| `NEXTAUTH_URL` | Auth callback URL | `http://localhost:3000` |

### Tailwind Configuration

Custom design system with:
- Extended color palette
- Custom animations
- Responsive breakpoints
- Component-specific styles

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Production

```bash
docker-compose up -d --build
```

### Health Check

The application includes a health check endpoint at `/api/health` for monitoring:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## 🔍 Monitoring

- Health check endpoint for uptime monitoring
- Error boundaries for graceful error handling
- Performance optimization with Next.js features
- Comprehensive logging for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Check the health status
- Verify environment configuration

---

**ModuleX Control Panel** - Professional admin dashboard for ModuleX backend management.
