# Step-by-Step OAuth Setup Guide

## 🔧 NEXTAUTH_SECRET (✅ COMPLETED)
Your NEXTAUTH_SECRET has been generated and added to your `.env.local` file.

---

## 🔑 Google OAuth Setup

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create or Select a Project
1. Click on the project dropdown (top left)
2. Click "New Project" or select an existing one
3. Give it a name like "IETF Chatbot" and click "Create"

### Step 3: Enable Google+ API (if needed)
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API" 
3. Click "Enable" (may already be enabled)

### Step 4: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" for testing
   - Fill in App name: "IETF Chatbot"
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue" through the scopes and test users

### Step 5: Configure OAuth Client
1. Application type: "Web application"
2. Name: "IETF Chatbot"
3. Authorized redirect URIs: Add these URLs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. Click "Create"

### Step 6: Copy Credentials
1. Copy the "Client ID" 
2. Copy the "Client secret"
3. Update your `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id-here
   GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
   ```

---

## 🐙 GitHub OAuth Setup

### Step 1: Go to GitHub Developer Settings
1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Sign in to your GitHub account

### Step 2: Create New OAuth App
1. Click "New OAuth App"
2. Fill in the form:
   - **Application name**: "IETF Chatbot"
   - **Homepage URL**: `http://localhost:3000`
   - **Application description**: "OAuth for IETF Chatbot application"
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`

### Step 3: Register Application
1. Click "Register application"
2. You'll be redirected to your new app's settings

### Step 4: Get Client Credentials
1. Copy the "Client ID" (visible immediately)
2. Click "Generate a new client secret"
3. Copy the "Client Secret" (⚠️ This will only be shown once!)

### Step 5: Update Environment Variables
Update your `.env.local` file:
```env
GITHUB_ID=your-actual-github-client-id
GITHUB_SECRET=your-actual-github-client-secret
```

---

## 📝 Final `.env.local` Example

Your final `.env.local` should look like this:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=zuth8oANXyVt4QdnqL9yMmIIr74xVA2iJJZTMPgsXco=

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz

# GitHub OAuth
GITHUB_ID=Iv1.1234abcd5678efgh
GITHUB_SECRET=abcdef1234567890abcdef1234567890abcdef12

OPENROUTER_API_KEY=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
```

---

## 🧪 Testing Your Setup

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Open your browser**:
   Navigate to `http://localhost:3000`

3. **Test authentication**:
   - Click the "Sign In" button in the top-right corner
   - Try signing in with Google
   - Try signing in with GitHub
   - Verify your name and avatar appear after successful login

---

## 🚨 Important Security Notes

- ✅ **Never commit `.env.local`** to version control (it's in `.gitignore`)
- ✅ **Keep your secrets private** - don't share them publicly
- ✅ **Use different credentials** for production vs development
- ✅ **Regularly rotate your secrets** for security

---

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid client" error**:
   - Double-check your Client ID and Client Secret
   - Ensure there are no extra spaces in your `.env.local`

2. **"Redirect URI mismatch"**:
   - Verify the callback URLs are exactly: 
     - Google: `http://localhost:3000/api/auth/callback/google`
     - GitHub: `http://localhost:3000/api/auth/callback/github`

3. **"Configuration invalid"**:
   - Restart your development server after updating `.env.local`
   - Check all environment variables are properly set

4. **OAuth consent screen issues**:
   - Make sure you've completed the OAuth consent screen setup in Google Cloud Console
   - Add your email as a test user if needed

---

## 🎉 Next Steps

Once you have OAuth working:

1. **Add more providers** (Discord, Twitter, etc.)
2. **Implement user roles** and permissions
3. **Add user profile** management
4. **Set up production** OAuth apps with your live domain

Need help with any specific step? Let me know!
