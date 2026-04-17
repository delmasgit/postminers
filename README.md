# PostMiners

A modern, full-stack application featuring a **Next.js** frontend and a **Django Modular Monolith** backend. It uses a highly secure, HttpOnly cookie-based JWT authentication system with seamless email verification via Resend.

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **npm** or **yarn**

---

## ⚙️ Backend Setup (Django)

**1. Navigate to the backend directory and create a virtual environment:**
```bash
cd backend
python -m venv venv
```

**2. Activate the virtual environment:**

- **Windows:** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

**3. Install dependencies:**
```bash
pip install -r requirements/base.txt
```

**4. Configure Environment Variables:**

Create a `.env` file in the root of your `backend` directory and add the following:
```env
# Use 'onboarding@resend.dev' if testing without a verified domain
RESEND_API_KEY=re_your_test_key_here
DEFAULT_FROM_EMAIL=onboarding@resend.dev
FRONTEND_URL=http://localhost:3000
```

**5. Apply migrations and start the server:**
```bash
python manage.py migrate
python manage.py runserver
```

> The backend is now running at `http://localhost:8000`.

---

## 💻 Frontend Setup (Next.js)

**1. Navigate to the frontend directory:**
```bash
cd frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure Environment Variables:**

Create a `.env.local` file in the root of your `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**4. Start the development server:**
```bash
npm run dev
```

> The frontend is now running at `http://localhost:3000`.

---

## 🧪 Testing the Authentication Flow Locally

Because this project uses Resend for transactional emails, local development email limits apply:

1. Register a new user at `http://localhost:3000/register`.
2. Check your **Django terminal output** — the system prints a debug verification link to the console.
3. Copy the `http://localhost:3000/verify?id=...` link from the terminal and paste it into your browser to verify the account.
4. Log in!
