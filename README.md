# Talents You Need - Frontend

> AI-powered talent marketplace connecting skilled professionals with exciting opportunities

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with role management
- 🎨 **Modern UI** - Beautiful, responsive design with dark mode
- 🤖 **AI-Powered Matching** - Semantic search using embeddings
- 💼 **Project Management** - Full CRUD for projects and applications
- 💬 **Real-time Messaging** - Chat between talents and recruiters
- 📊 **Analytics Dashboards** - Insights for both user types
- 🔍 **Advanced Search** - Filter and find talents with AI assistance
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (Laravel)

### Installation

```bash
# Clone and navigate
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Talents You Need
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📚 Tech Stack

### Core
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **React 18** - UI library
- **Tailwind CSS** - Styling

### State Management
- **Zustand** - Global state
- **React Query** - Server state & caching

### Forms & Validation
- **React Hook Form** - Form management
- **Zod** - Schema validation

### UI Components
- **Headless UI** - Accessible components
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### HTTP & API
- **Axios** - HTTP client
- **React Query** - Data fetching

## 📁 Project Structure

```
src/
├── app/                    # Next.js pages (App Router)
│   ├── (auth)/            # Auth pages
│   ├── (dashboard)/       # Protected pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── auth/              # Auth components
│   ├── layout/            # Layout components
│   ├── projects/          # Project components
│   ├── talents/           # Talent components
│   ├── ui/                # Reusable UI
│   └── Providers.tsx      # App providers
├── lib/
│   ├── api/               # API clients
│   └── utils.ts           # Utilities
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── styles/                # Global styles
```

## 🎯 Key Features Detail

### Authentication
- Login/Register with validation
- JWT token management
- Protected routes
- Role-based access (Talent/Recruiter/Admin)
- Password reset flow

### Dashboards
**Talent Dashboard:**
- Application tracking
- Recommended projects
- Profile stats

**Recruiter Dashboard:**
- Project management
- Application reviews
- Talent search

### AI-Powered Features
- Semantic talent search
- Project-talent matching
- Similarity scoring
- Natural language queries

### Project Management
- Browse/search projects
- Create & edit projects
- Apply to projects
- Track applications

### Messaging
- Real-time conversations
- Message history
- Unread indicators
- Search conversations

### Profile Management
- Edit profile info
- Upload avatar
- Add skills/experience
- Portfolio showcase

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking

# Cleanup
npm run clean        # Remove build files
```

## 🔌 API Integration

The frontend connects to a Laravel backend. All API calls go through:

```typescript
import api from '@/lib/api/axios';

// Example usage
const response = await api.get('/projects');
const project = await api.post('/projects', data);
```

### Available API Clients
- `authAPI` - Authentication
- `projectsAPI` - Projects
- `applicationsAPI` - Applications
- `searchAPI` - AI search
- `talentsAPI` - Talent profiles
- `messagesAPI` - Messaging

## 🎨 Theming

### Colors
The app uses a blue-based color scheme with full dark mode support:

```javascript
primary: #0ea5e9 (Sky Blue)
secondary: #64748b (Slate)
success: #10b981 (Green)
warning: #f59e0b (Amber)
error: #ef4444 (Red)
```

### Dark Mode
Automatic dark mode support based on system preferences. Toggle available in UI.

## 📱 Responsive Design

Built mobile-first with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 🔒 Security

- XSS protection (React default)
- CSRF tokens
- Secure token storage
- Input sanitization
- Role-based access control

## ⚡ Performance

- Code splitting
- React Query caching
- Image optimization
- Debounced inputs
- Lazy loading
- Tree shaking

## 🐛 Known Issues

None currently! 🎉

## 📈 Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] PWA support
- [ ] Advanced analytics
- [ ] Video calls integration
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Vercel for hosting and deployment
- All open-source contributors

## 📞 Support

- 📧 Email: support@talentsyouneed.com
- 💬 Discord: [Join our community](#)
- 📖 Docs: [Documentation](#)
- 🐛 Issues: [GitHub Issues](#)

---

**Built with ❤️ by the Talents You Need Team**

Made possible by Next.js, TypeScript, React Query, and Tailwind CSS.