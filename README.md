# CloudMart E-Commerce Application

A complete full-stack e-commerce application. This project demonstrates a modern architecture with a React frontend, Supabase for the backend/database, and deployment on Vercel.

## 🚀 Quick Start

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Run locally**:
    ```bash
    npm run dev
    ```

## 🛠 Tech Stack

**Frontend:**
- React 18 (TypeScript)
- Vite
- Tailwind CSS (Styling)
- Context API (State Management)
- Axios (API Requests)

**Backend / Database:**
- Supabase (PostgreSQL, Authentication)

**Deployment:**
- Vercel

---

## 📂 Project Structure

```
/
├── index.html              # Entry HTML
├── index.tsx               # React Entry
├── App.tsx                 # Main Component & Routing
├── services/
│   └── api.ts              # API Service
├── components/             # Reusable UI Components
├── pages/                  # Page Views (Home, Admin, Login)
├── context/                # Global State (Auth, Cart, etc.)
└── README.md
```

---

## 🔧 Supabase Setup

To connect your application to Supabase:

1.  **Create a Supabase Project**: Go to [Supabase](https://supabase.com/) and start a new project.
2.  **Get Credentials**: Retrieve your `Project URL` and `anon public key` from the API settings.
3.  **Environment Variables**: Create a `.env` (or `.env.local`) file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Database Config**: Set up your tables (e.g., `products`, `users`) in the Supabase Dashboard.

---

## 🚀 Deployment on Vercel

1.  **Push to GitHub**: Ensure your latest code is pushed to your repository.
2.  **Import to Vercel**:
    - Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    - Click "Add New..." -> "Project".
    - Import your GitHub repository.
3.  **Configure Environment Variables**:
    - In the deployment setup, add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4.  **Deploy**: Click "Deploy" to build and launch your site.

---

## 🔐 Security Features

- **Supabase Auth**: Secure authentication handling.
- **Row Level Security (RLS)**: Enforce access policies directly on the database tables.
- **Environment Variables**: Sensitive keys are kept secret and not committed to version control.

## 🔮 Future Enhancements

- Stripe Payment Integration.
- Real-time inventory updates using Supabase Realtime.
