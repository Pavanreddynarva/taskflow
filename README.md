# TaskFlow — Team Task Manager

A full-stack team task management app with role-based access (Admin & Member), project management, task tracking, and a real-time dashboard.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Auth** | JWT signup/login, bcrypt passwords, role-based (Admin / Member) |
| **Projects** | Create, update, delete projects; assign members; color-coded |
| **Tasks** | Create tasks, assign to members, set priority & deadline, track status |
| **Dashboard** | Stat cards, filter by status (pending / in-progress / completed / overdue) |
| **Progress** | Per-project progress bars with task completion % |

---

## 📁 Folder Structure

```
taskmanager/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # signup, login, getMe, getAllUsers
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js            # protect + restrictTo
│   │   └── error.js           # global error handler
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── .env.example
│   ├── railway.toml
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx + .css
    │   │   ├── TaskCard.jsx + .css
    │   │   ├── ProjectModal.jsx
    │   │   ├── TaskModal.jsx
    │   │   └── Modal.css
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProjectsPage.jsx
    │   │   └── ProjectDetailPage.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios instance + all API calls
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css           # Design system + global styles
    ├── .env.example
    ├── railway.toml
    └── package.json
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |
| GET | `/api/auth/users` | Auth | List all users |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/projects` | Auth | Get accessible projects |
| POST | `/api/projects` | Auth | Create project |
| GET | `/api/projects/:id` | Auth (member) | Get project details |
| PUT | `/api/projects/:id` | Owner/Admin | Update project |
| DELETE | `/api/projects/:id` | Owner/Admin | Delete project + tasks |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/tasks` | Auth | Get all tasks (filterable) |
| GET | `/api/tasks/stats` | Auth | Get dashboard stats |
| GET | `/api/tasks/project/:projectId` | Auth (member) | Get project tasks |
| POST | `/api/tasks/project/:projectId` | Auth (member) | Create task |
| PUT | `/api/tasks/:id` | Auth (member) | Update task |
| DELETE | `/api/tasks/:id` | Creator/Admin | Delete task |

**Query params for GET /api/tasks:** `status`, `priority`, `projectId`, `assignedTo`  
Pass `status=overdue` to get overdue tasks.

---

## 🏁 Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)

### 1. Clone & configure

```bash
git clone <your-repo>
cd taskmanager
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# MONGODB_URI=mongodb+srv://...
# JWT_SECRET=any_long_random_string

npm install
npm run dev    # Starts on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

npm install
npm start      # Starts on http://localhost:3000
```

### 4. Seed demo data (optional)

```bash
cd backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const hash = await bcrypt.hash('password123', 12);
  await User.create([
    { name: 'Admin User', email: 'admin@demo.com', password: hash, role: 'admin' },
    { name: 'Alice Member', email: 'alice@demo.com', password: hash, role: 'member' },
  ]);
  console.log('✅ Demo users created');
  process.exit(0);
});
"
```

---

## 🚀 Deploy on Railway

### Step 1: Create MongoDB Atlas cluster
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user (save username/password)
4. Add `0.0.0.0/0` to IP allowlist
5. Copy the connection string (replace `<password>`)

### Step 2: Deploy Backend to Railway
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select your **backend** folder (or use the root monorepo)
3. Set these Environment Variables in Railway:
   ```
   PORT=5000
   MONGODB_URI=<your atlas URI>
   JWT_SECRET=<long random string>
   JWT_EXPIRE=7d
   NODE_ENV=production
   FRONTEND_URL=<your frontend Railway URL>  ← add after step 3
   ```
4. Railway auto-detects Node.js and runs `npm start`
5. Copy your backend URL: `https://taskflow-backend-xxx.railway.app`

### Step 3: Deploy Frontend to Railway
1. New service → GitHub → select **frontend** folder
2. Set Environment Variables:
   ```
   REACT_APP_API_URL=https://taskflow-backend-xxx.railway.app/api
   ```
3. Railway builds with `npm run build` and serves via `serve`
4. Copy frontend URL → go back to backend service → add `FRONTEND_URL=<frontend URL>`

### Step 4: Verify
- Visit `https://<backend>.railway.app/api/health` → should return `{"status":"OK"}`
- Visit `https://<frontend>.railway.app` → app loads, signup works

### Monorepo tip
If deploying from a monorepo root, set **Root Directory** in Railway service settings to `/backend` or `/frontend` respectively.

---

## 🔐 Role Capabilities

| Action | Admin | Member |
|---|---|---|
| View all projects | ✅ | ✗ (own only) |
| Create project | ✅ | ✅ |
| Delete any project | ✅ | ✗ (own only) |
| View all tasks | ✅ | ✗ (own projects) |
| Create tasks | ✅ | ✅ (in member projects) |
| Delete any task | ✅ | ✗ (own only) |
| List all users | ✅ | ✅ |

---

## 🛠 Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs  
**Frontend:** React 18 · React Router v6 · Axios · date-fns  
**Styling:** Custom CSS design system (dark theme, CSS variables)  
**Deploy:** Railway (backend + frontend as separate services)
