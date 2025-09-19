# Fix Supabase Authentication on Vercel

## 🚨 Issue: Login working on localhost but not on Vercel

This is a common issue with Supabase authentication in production. Here's how to fix it:

## ✅ Step 1: Configure Redirect URLs in Supabase

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Authentication → URL Configuration
3. **Add these URLs to "Redirect URLs"**:
   ```
   https://YOUR-VERCEL-APP.vercel.app/
   https://YOUR-VERCEL-APP.vercel.app/dashboard
   https://YOUR-VERCEL-APP.vercel.app/fan-dashboard
   https://YOUR-VERCEL-APP.vercel.app/login
   https://YOUR-VERCEL-APP.vercel.app/signup
   ```
   
4. **Replace `YOUR-VERCEL-APP`** with your actual Vercel app name

## ✅ Step 2: Configure Site URL

1. **In Supabase Dashboard**: Authentication → URL Configuration
2. **Set Site URL to**: `https://YOUR-VERCEL-APP.vercel.app`

## ✅ Step 3: Verify Environment Variables in Vercel

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Ensure these variables exist**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
   ```

## ✅ Step 4: Check Vercel Deployment Logs

1. **Go to Vercel Dashboard** → Deployments → Click on latest deployment
2. **Check the logs** for any environment variable errors
3. **Look for Supabase connection errors**

## 🔧 Common Fixes

### Fix 1: Update Supabase Auth Configuration
```sql
-- Run this in your Supabase SQL Editor if needed
UPDATE auth.config 
SET site_url = 'https://YOUR-VERCEL-APP.vercel.app'
WHERE parameter = 'SITE_URL';
```

### Fix 2: Clear Browser Cache
- Clear cookies and localStorage for your Vercel domain
- Try login in incognito/private browsing mode

### Fix 3: Check Network Tab
- Open browser DevTools → Network tab
- Try logging in and look for failed requests to Supabase
- Check if any requests are being blocked by CORS

## 🚀 Testing Steps

1. **Deploy to Vercel** with the fixes above
2. **Test in incognito mode** to avoid cached auth issues
3. **Check browser console** for any authentication errors
4. **Verify redirect flow**: Login → Should redirect to dashboard

## 📋 Checklist

- [ ] Added Vercel URLs to Supabase Redirect URLs
- [ ] Set correct Site URL in Supabase
- [ ] Verified environment variables in Vercel
- [ ] Cleared browser cache
- [ ] Tested in incognito mode
- [ ] Checked Vercel deployment logs
- [ ] Checked browser console for errors

## 🆘 If Still Not Working

1. **Check Supabase logs**: Dashboard → Logs → Auth logs
2. **Enable debug mode**: Add `console.log` statements in auth-context.tsx
3. **Test with different browsers**
4. **Verify Supabase project is active** and not paused
