# Algobase

A full-stack Rubik's Cube training application for speedcubers to learn algorithms and track solving progress.

Live Demo: [Here](https://algobase-app.vercel.app)

## Tech Stack

**Frontend:** Next.js, React, TypeScript  
**Backend:** PostgreSQL, Drizzle ORM, Neon Database  
**Styling:** Tailwind CSS  

## Installation

1. Clone the repository
```bash
git clone https://github.com/ian-yeh/algobase.git
cd algobase
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```env
DATABASE_URL=your_postgresql_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run database migrations
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Usage

1. Create an account to start tracking progress
2. Select algorithm categories to practice
3. Use the interactive trainer for timed practice sessions
4. View statistics and personal records on your dashboard

Built by [Ian Yeh](https://github.com/ian-yeh)
