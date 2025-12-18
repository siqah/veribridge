# Authentication & Pre-Launch Implementation Guide

## ✅ What's Been Completed

### Backend Authentication (100% Complete)

**Database**:

- ✅ `users` table created
- ✅ `user_sessions` table for token management
- ✅ `user_id` added to `company_formations`
- ✅ `user_id` added to `mailbox_subscriptions`

**API Endpoints**:

- ✅ `POST /api/auth/signup` - Register new users
- ✅ `POST /api/auth/login` - Login with JWT token
- ✅ `GET /api/auth/me` - Get current user (protected)
- ✅ `POST /api/auth/logout` - Logout
- ✅ `authenticateToken` middleware for protected routes

**Features**:

- Password hashing with bcrypt
- JWT tokens (7-day expiration)
- Email uniqueness validation
- Last login tracking

**Test the API**:

```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (use token from login)
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 What's Remaining

### Frontend Components (Not Built Yet)

You need to build these React components:

#### 1. **AuthContext.jsx** (Global Auth State)

```jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Fetch current user
      fetch("http://localhost:3001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUser(data.user);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return { success: true };
    }

    return { success: false, error: data.error };
  };

  const signup = async (email, password, fullName) => {
    const res = await fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    });

    const data = await res.json();

    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      return { success: true };
    }

    return { success: false, error: data.error };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### 2. **Login.jsx** (Login Page)

```jsx
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto card">
      <h2 className="text-2xl font-bold mb-6">Login to VeriBridge</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field w-full"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field w-full"
            required
          />
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
```

#### 3. **Signup.jsx** (Registration Page)

Similar to Login.jsx but with additional fields.

#### 4. **ProtectedRoute.jsx** (Route Wrapper)

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

---

### Legal Pages (Templates Provided)

#### Terms of Service Content

Use standard SaaS terms. Key sections:

- Service Description
- User Obligations
- Payment Terms (Paystack, no refunds after processing)
- Liability Limitations
- Governing Law (Kenya)

#### Privacy Policy Content

GDPR-compliant template. Key sections:

- Data collected (email, name, payment info)
- How data is used (order processing, communication)
- Data sharing (Paystack for payments, 1st Formations for incorporation)
- User rights (data access, deletion)
- Cookie usage

**Quick Implementation**:

1. Use https://www.termsfeed.com/privacy-policy-generator/
2. Customize for VeriBridge
3. Create `/client/src/components/legal/TermsOfService.jsx`
4. Create `/client/src/components/legal/PrivacyPolicy.jsx`
5. Add routes in App.jsx
6. Link from footer

---

## 🚀 Quick Start Guide (Next Steps)

### Step 1: Add JWT Secret to .env

**File**: `/server/.env`

Add:

```bash
JWT_SECRET=veribridge-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRES_IN=7d
```

### Step 2: Restart Server

The auth routes are already registered. Just restart:

```bash
npm run dev
```

### Step 3: Test Auth API

Try signup/login with curl (see examples above).

### Step 4: Build Frontend (Your Task)

1. Create `AuthContext.jsx`
2. Wrap App with `<AuthProvider>`
3. Create Login & Signup pages
4. Update navigation to show Login/Logout
5. Protect routes (My Orders, Company Formation)
6. Update API calls to include `Authorization: Bearer ${token}` header

### Step 5: Update Formation to Use user_id

**File**: `/server/src/routes/formation.js`

In the POST `/api/formation` endpoint, get user from token:

```javascript
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // From JWT

  // ... existing code ...

  const orderId = uuidv4();
  const insertStmt = db.prepare(`
    INSERT INTO company_formations (id, user_id, company_name, ...)
    VALUES (?, ?, ?, ...)
  `);

  insertStmt.run(orderId, userId, formData.companyName, ...);
});
```

### Step 6: Legal Pages

1. Generate Terms & Privacy using online tool
2. Create React components
3. Add to footer

### Step 7: 1st Formations Signup

- Visit https://www.1stformations.co.uk/professionals/
- Takes 1-2 days for verification
- Get wholesale pricing

---

## Environment Setup Checklist

**Server `.env`:**

```bash
✅ PAYSTACK_SECRET_KEY
✅ ADMIN_EMAIL
✅ SMTP credentials
✅ JWT_SECRET (add this!)
✅ JWT_EXPIRES_IN
```

**Client `.env.local`:**

```bash
✅ VITE_PAYSTACK_PUBLIC_KEY
✅ VITE_API_URL
```

---

## Testing Checklist

### Auth Flow

- [ ] Sign up new user
- [ ] Receive JWT token
- [ ] Token stored in localStorage
- [ ] Login with credentials
- [ ] Access protected routes
- [ ] Logout clears token
- [ ] Unauthorized access redirects to login

### Order Integration

- [ ] Orders tied to user_id
- [ ] "My Orders" shows only user's orders
- [ ] Can't view other users' orders

---

## Production Security Checklist

Before deploying:

- [ ] Change JWT_SECRET to random 32+ char string
- [ ] Set JWT expiration appropriately
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Add rate limiting to auth endpoints
- [ ] Implement password reset flow
- [ ] Add email verification
- [ ] Enable CORS whitelist
- [ ] Hash sensitive data
- [ ] Sanitize user inputs

---

## What You Have Now

**Backend** (100% Complete):

- JWT authentication
- User management
- Protected routes
- Password security

**Frontend** (Not Started):

- Need to build Login/Signup
- Need AuthContext
- Need to protect routes
- Need to update API calls

**Estimate**: 3-4 hours to complete frontend + legal pages.

---

## Quick Win Alternative

**If short on time**, you can launch with:

- Simple password protection on admin panel (already exists)
- No user accounts initially
- All orders stored without user_id
- Add authentication post-launch

This gets you live faster, then add auth when you have paying customers.

**Your call!** 🚀
