# Lumina Skincare Boutique - Frontend

This is the React 19 + Vite + Tailwind CSS frontend repository for Lumina Skincare Boutique.

## Features

- **Interactive Ritual Booking Wizard**: Multi-step calendar appointment booking communicating with the backend API.
- **AI Skierge Chatbot**: 24/7 intelligent beauty concierge powered by server-side Gemini.
- **Bespoke Services & Product Catalog**: Live synchronized catalog cards.
- **Admin Operations Desk**: Real-time management interface for appointments and contact inquiries.
- **User Authentication**: Firebase Auth for client accounts and administrator access.

## Setup and Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment in `.env`:
```env
# URL to your deployed backend (e.g. http://localhost:3000)
VITE_API_BASE_URL=http://localhost:3000

# Client-side Firebase keys
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```
