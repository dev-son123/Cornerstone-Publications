# 🚀 DEPLOYMENT QUICK START

## One-Command Deployment

```powershell
.\deploy.ps1
```

This script will:
1. ✅ Build your React app
2. ✅ Create a deployment zip file
3. ✅ Show you exactly what to upload

---

## Manual Deployment Steps

### 1. Build the app
```powershell
cd app
npm run build
cd ..
```

### 2. Upload to Hostinger
- Login to Hostinger → File Manager
- Navigate to: `public_html/`
- Delete existing files
- Upload all files from: `app/dist/`
  - `index.html`
  - `assets/` folder
  - `logo.jpeg`
  - `journal-logo.jpeg`
  - `_redirects`

### 3. Set up environment variables
In Hostinger File Manager, create `.env` in `public_html/`:
```
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Optional Cleanup

Remove editor config files (doesn't affect deployment):
```powershell
.\cleanup-optional.ps1
```

---

## Deployment Checklist

- [ ] Run `npm run build` (creates `app/dist/`)
- [ ] Verify `app/dist/` has all files
- [ ] Login to Hostinger File Manager
- [ ] Navigate to `public_html/`
- [ ] Upload all files from `app/dist/`
- [ ] Create `.env` file in `public_html/`
- [ ] Add Supabase credentials to `.env`
- [ ] Test your site

---

## Troubleshooting

**Build fails?**
```powershell
cd app
npm install
npm run build
```

**Files not showing?**
- Check Hostinger File Manager for `index.html` in `public_html/`
- Ensure you uploaded the entire `assets/` folder

**White screen?**
- Check browser console for errors
- Verify environment variables in `.env`
- Check Hostinger error logs

---

## Key Points

✅ Upload only `app/dist/` contents
✅ Never upload `node_modules/`
✅ Keep `.git/` locally (version control)
✅ Environment variables set separately on Hostinger
✅ `_redirects` enables React Router on Hostinger

---

**Questions?** Check `DEPLOYMENT_GUIDE.md` for detailed info.
