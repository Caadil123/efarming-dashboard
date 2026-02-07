
# Hostinger Environment Variables Setup

The "Internal Server Error" is happening because your server (Hostinger) does not have access to the secret keys and database configuration that are on your local computer. You must manually add these Environment Variables in your Hostinger dashboard.

## 1. Go to your Hostinger Dashboard
1. Navigate to your **VPS** or **Website** settings where you deployed the app.
2. Look for a section called **"Environment Variables"** or **"App Settings"**.
3. Add the following variables one by one.

## 2. Add These Variables

### DATABASE_URL
**Key:** `DATABASE_URL`
**Value:** `postgres://5832a11d7befd3bd9915058dae1631b99e3f3683d755d2a69b632268e29ddf5b:sk_osYC4O_DbYeYVN5ric3T2@db.prisma.io:5432/postgres?sslmode=require`

### NEXTAUTH_SECRET
**Key:** `NEXTAUTH_SECRET`
**Value:** `07d50b09e031a85d755ed5bcdd8b68157e91d8a07287a2fa6c07fb7808b4f9f3`
*(This is the secret used for encrypting sessions. It must match or be a secure random string.)*

### NEXTAUTH_URL
**Key:** `NEXTAUTH_URL`
**Value:** `https://dashboard.efarmingsom.com`
*(If your site is on a different domain or subdomain, use that instead. Do NOT use localhost here.)*

### UPLOADTHING_TOKEN
**Key:** `UPLOADTHING_TOKEN`
**Value:** `eyJhcGlLZXkiOiJza19saXZlXzhlMWVkYzI5MGQwZjFhNjE0ZjA3MWVkMmE2OWFjYjgyYjEyMDBjOGQ2ZmJhODE5NzUyNTUwODEyYTczYzg5ZmEiLCJhcHBJZCI6ImVyeW5tejZiM3MiLCJyZWdpb25zIjpbInNlYTEiXX0=`

## 3. Redeploy or Restart
After adding these variables, you MUST **restart** your application or trigger a **redeploy** for the changes to take effect.
