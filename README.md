# FlutterBox

An open-source platform for sharing and discovering Flutter widgets with real-time preview capabilities.

## Overview

FlutterBox is a minimalist, monochrome platform that enables developers to share, discover, and preview Flutter widgets in real-time. Built with modern web technologies and designed for simplicity and speed, it provides a centralized hub for the Flutter community to collaborate on reusable UI components.

## Features

### Core Functionality
- **Widget Publishing**: Share your Flutter widgets with the community
- **Live Preview**: Test widgets instantly with embedded DartPad integration
- **Code Editor**: Monaco Editor with Flutter/Dart syntax highlighting
- **Social Features**: Like, comment, and fork widgets from other developers
- **Search & Discovery**: Browse widgets by category, tags, or search terms
- **User Profiles**: Showcase your widget collection and track statistics

### Technical Features
- **Real-time Updates**: Supabase subscriptions for live data synchronization
- **Authentication**: Secure email/password authentication via Supabase Auth
- **Responsive Design**: Fully responsive interface for all device sizes
- **Dark Mode Support**: Monochrome theme optimized for reduced eye strain
- **Performance Optimized**: Next.js App Router with server-side rendering

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Code Editor**: Monaco Editor
- **Preview**: DartPad embedded iframe
- **Package Manager**: pnpm

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.17 or later
- pnpm 8.0 or later
- Git

You'll also need:
- A Supabase account and project
- Basic knowledge of React and TypeScript

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/dvillegastech/flutterbox.git
cd flutterforge
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Database Setup

1. Navigate to your Supabase project dashboard
2. Go to the SQL editor
3. Execute the SQL scripts from the `sql/` directory in order:
   - `01_initial_schema.sql` - Creates the base tables
   - `02_rls_policies.sql` - Sets up Row Level Security
   - `03_functions.sql` - Creates necessary functions
   - `04_triggers.sql` - Sets up database triggers

### 5. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
flutterbox/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── widgets/           # Widget-specific components
│   ├── dashboard/         # Dashboard components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── sql/                   # Supabase SQL scripts
└── public/                # Static assets
```

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code
pnpm format
```

### Code Style

This project follows strict TypeScript and ESLint rules. Please ensure your code passes all checks before submitting a pull request:

```bash
pnpm lint
pnpm build
```

## Database Schema

### Core Tables

- **profiles**: Extended user information
- **widgets**: Flutter widget definitions
- **likes**: User-widget like relationships
- **comments**: Comments on widgets

### Row Level Security

All tables are protected with Row Level Security (RLS) policies to ensure data privacy and security. Users can only:
- Read public widgets
- Modify their own widgets
- Like and comment on public widgets

## Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting a pull request.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Deployment

### Vercel Deployment

1. Fork this repository
2. Create a new project on Vercel
3. Connect your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Self-Hosting

You can self-host FlutterBox on any platform that supports Node.js:

1. Build the application: `pnpm build`
2. Set environment variables
3. Start the server: `pnpm start`

## Security

### Reporting Security Issues

If you discover a security vulnerability, please email security@flutterbox.dev instead of using the issue tracker. All security issues will be promptly addressed.

### Security Features

- Row Level Security (RLS) on all database tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive configuration
- CSRF protection
- Input sanitization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Flutter team for the amazing framework
- DartPad team for the embedded preview functionality
- Supabase team for the backend infrastructure
- shadcn for the beautiful UI components
- All contributors who help improve this platform

## Support

### Documentation

Full documentation is available at [https://docs.flutterbox.dev](https://docs.flutterbox.dev)

### Community

- GitHub Discussions: [github.com/dvillegastech/flutterbox/discussions](https://github.com/dvillegastech/flutterbox/discussions)
- Discord: [discord.gg/flutterbox](https://discord.gg/flutterbox)
- Twitter: [@flutterbox](https://twitter.com/flutterbox)

### Reporting Issues

Please use the GitHub issue tracker to report bugs or request features: [github.com/dvillegastech/flutterbox/issues](https://github.com/dvillegastech/flutterbox/issues)

## Roadmap

### Current Focus
- Improving DartPad integration
- Adding more widget categories
- Performance optimizations

### Future Plans
- Widget collections and playlists
- Advanced search with AI
- Widget analytics dashboard
- Team collaboration features
- API for external integrations

## Status

![Build Status](https://img.shields.io/github/workflow/status/dvillegastech/flutterbox/CI)
![License](https://img.shields.io/github/license/dvillegastech/flutterbox)
![Contributors](https://img.shields.io/github/contributors/dvillegastech/flutterbox)
![Stars](https://img.shields.io/github/stars/dvillegastech/flutterbox)

---

Built with passion for the Flutter community