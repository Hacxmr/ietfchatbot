# Clerk Authentication Setup Guide

This project uses Clerk for modern, secure authentication with built-in UI components.

## 🚀 Quick Setup

### Step 1: Create a Clerk Account
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose your authentication methods (Email, Google, GitHub, etc.)

### Step 2: Get Your API Keys
1. In your Clerk dashboard, go to "API Keys"
2. Copy your keys to `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (optional - defaults work for most cases)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Step 3: Configure Authentication Methods
In your Clerk dashboard:

1. **Email/Password**: Already enabled by default
2. **Google OAuth**: 
   - Go to "SSO Connections" → "Add connection" → "Google"
   - Follow the setup wizard
3. **GitHub OAuth**:
   - Go to "SSO Connections" → "Add connection" → "GitHub"
   - Follow the setup wizard
4. **Other providers**: Discord, Twitter, LinkedIn, etc.

## ✅ What's Already Configured

### Components
- ✅ **UserAuthButton**: Sign in/out button with Clerk's built-in UI
- ✅ **Authentication pages**: `/sign-in` and `/sign-up` routes
- ✅ **useAuth hook**: Easy access to user state

### Features
- ✅ **Multiple OAuth providers** (configure in Clerk dashboard)
- ✅ **Email verification**
- ✅ **Password reset**
- ✅ **User profiles** with avatars
- ✅ **Session management**
- ✅ **TypeScript support**
- ✅ **Route protection** (optional)

## 🎯 Key Advantages of Clerk

### vs NextAuth.js:
- **No setup complexity** - works out of the box
- **Built-in UI components** - no need to build forms
- **Better security** - automatic security updates
- **User management** - admin dashboard included
- **Real-time updates** - automatic session sync
- **Better developer experience** - simpler API

### Features included:
- 🔐 **Multi-factor authentication**
- 👤 **User profiles and avatars**
- 📧 **Email verification**
- 🔑 **Password reset**
- 📱 **Mobile-friendly**
- 🎨 **Customizable themes**
- 📊 **Analytics dashboard**

## 📁 File Structure

```
app/
├── layout.tsx                    # ClerkProvider wrapper
├── sign-in/[[...sign-in]]/
│   └── page.tsx                 # Clerk sign-in page
├── sign-up/[[...sign-up]]/
│   └── page.tsx                 # Clerk sign-up page
└── page.tsx                     # Main app with auth button

components/
├── user-auth-button.tsx         # Clerk auth button
└── ui/                          # UI components (unchanged)

hooks/
└── useAuth.ts                   # Clerk authentication hook

middleware.ts                    # Route protection
```

## 🔧 Usage Examples

### Basic Authentication Check
```tsx
import { useAuth } from "@/hooks/useAuth"

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
      <img src={user?.imageUrl} alt="Avatar" />
    </div>
  )
}
```

### Protecting Routes
Routes are automatically protected by middleware. To protect specific routes, update `middleware.ts`:

```typescript
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/profile(.*)',
])
```

### Manual Sign In/Out
```tsx
import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs'

function AuthButtons() {
  const { isSignedIn } = useUser()

  if (isSignedIn) {
    return <SignOutButton>Sign out</SignOutButton>
  }

  return <SignInButton mode="modal">Sign in</SignInButton>
}
```

### Access User Data
```tsx
import { useUser } from '@clerk/nextjs'

function UserProfile() {
  const { user } = useUser()

  return (
    <div>
      <h2>{user?.fullName}</h2>
      <p>{user?.emailAddresses[0]?.emailAddress}</p>
      <p>Joined: {user?.createdAt?.toDateString()}</p>
    </div>
  )
}
```

## 🧪 Testing Your Setup

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Test authentication flow**:
   - Visit `http://localhost:3000`
   - Click "Sign In" button
   - Try different authentication methods
   - Verify user information displays correctly

3. **Test protected routes** (if configured):
   - Try accessing protected routes while signed out
   - Should redirect to sign-in page

## 🌐 Production Deployment

### Environment Variables
Set these in your production environment:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Domain Configuration
1. In Clerk dashboard, go to "Domains"
2. Add your production domain
3. Update any OAuth redirect URLs

## 🔒 Security Features

### Built-in Security:
- ✅ **CSRF protection**
- ✅ **XSS protection**
- ✅ **Session fixation protection**
- ✅ **Automatic security updates**
- ✅ **Rate limiting**
- ✅ **Bot detection**

### Best Practices:
- 🔐 Enable MFA for admin users
- 📧 Require email verification
- 🔑 Use strong password policies
- 📊 Monitor authentication analytics
- 🚨 Set up security alerts

## 🎨 Customization

### Theme Customization
Clerk components inherit your app's CSS variables. Customize in `globals.css`:

```css
.cl-formButtonPrimary {
  background-color: hsl(var(--primary));
}

.cl-card {
  border: 1px solid hsl(var(--border));
}
```

### Custom Components
```tsx
import { SignIn } from '@clerk/nextjs'

<SignIn 
  appearance={{
    theme: 'dark',
    variables: {
      colorPrimary: 'hsl(var(--primary))',
    }
  }}
/>
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/nextjs/overview)
- [Customization Guide](https://clerk.com/docs/customization/overview)
- [API Reference](https://clerk.com/docs/reference/frontend-api)

## 🐛 Troubleshooting

### Common Issues:

1. **"Clerk not initialized" error**:
   - Check environment variables are set
   - Ensure ClerkProvider wraps your app

2. **Sign-in page not found**:
   - Verify sign-in route exists: `/sign-in/[[...sign-in]]/page.tsx`
   - Check middleware configuration

3. **Environment variables not loading**:
   - Restart development server
   - Check `.env.local` file location
   - Ensure variables start with `NEXT_PUBLIC_` for client-side

4. **OAuth not working**:
   - Configure OAuth in Clerk dashboard
   - Check redirect URLs match exactly

5. **Middleware errors**:
   - Update `@clerk/nextjs` to latest version
   - Check middleware syntax matches Clerk docs

---

🎉 **Your authentication is now powered by Clerk!** Much simpler than NextAuth.js with better security and user experience out of the box.
