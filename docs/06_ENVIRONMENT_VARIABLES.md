# 06. Environment Variables

This document lists all the `.env` variables required for the project. Never commit `.env` files to GitHub.

## Backend (`probation-portal-api/.env`)
```env
# The connection string for the Prisma Database (Neon/Supabase)
DATABASE_URL="postgresql://user:password@host:port/db?sslmode=require"

# A long random string used to sign JSON Web Tokens
JWT_SECRET="your_very_long_random_string_here"

# Frontend URL (For CORS and email links)
FRONTEND_URL="https://probation-portal-backend.vercel.app"
PORT=3000

# SMTP / Nodemailer Settings (For OTP Emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Pusher Settings (For Realtime UI Updates)
PUSHER_APP_ID="your_app_id"
PUSHER_KEY="your_key"
PUSHER_SECRET="your_secret"
PUSHER_CLUSTER="ap2"
```

## Frontend (`probation-portal/.env`)
```env
# The URL pointing to your Vercel Backend API
EXPO_PUBLIC_API_URL="https://probation-portal-backend.vercel.app/api"

# Pusher Settings (Must match Backend)
EXPO_PUBLIC_PUSHER_KEY="your_key"
EXPO_PUBLIC_PUSHER_CLUSTER="ap2"
```

## Adding Env Variables to EAS Builds
When you build on EAS (Expo Application Services), it **does not** read your local `.env` file by default for security reasons.

You must do one of two things:
1. Hardcode it in `eas.json` (Okay for public APIs, bad for secrets).
2. Store it securely in the Expo Dashboard.

**To add it to Expo Dashboard:**
1. Go to [expo.dev](https://expo.dev)
2. Select **probation-portal**
3. Go to **Secrets** on the left menu.
4. Add `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_PUSHER_KEY` as new variables.

Once added, any `eas build` or `eas update` command you run will automatically pull these secrets in.
