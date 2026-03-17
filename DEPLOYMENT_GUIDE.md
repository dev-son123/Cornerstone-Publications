# Cornerstone Research - Deployment Guide

## 📋 Current Structure Analysis

### ✅ KEEP (Essential for development)
```
cornerstone/
├── .git/                    ← Version control history
├── .gitignore              ← Git configuration
├── app/                    ← Your React application
│   ├── src/               ← Source code
│   ├── public/            ← Static assets
│   ├── dist/              ← Production build (UPLOAD THIS)
│   ├── package.json       ← App dependencies
│   └── [config files]
└── package.json           ← Root level (optional monorepo)
```

### ⚠️ CAN REMOVE (Won't affect deployment)
```
.vscode/                   ← Local editor settings
.hintrc                    ← HTML linter config
app/.vscode/              ← Local editor settings (app level)
```

### ❌ NEVER UPLOAD (Dependencies)
```
node_modules/             ← Installed locally only
app/node_modules/         ← Installed locally only
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Step 1: Build the App
```powershell
cd C:\Users\Ganesh\Desktop\cornerstone\app
npm run build
```
✅ Creates: `app/dist/` folder with production files

### Step 2: Verify Production Build
```powershell
ls C:\Users\Ganesh\Desktop\cornerstone\app\dist\
```
Should contain:
- `index.html`
- `assets/` (folder with .js and .css files)
- `logo.jpeg`, `journal-logo.jpeg`
- `_redirects`

### Step 3: Upload to Hostinger
- Open Hostinger File Manager
- Navigate to `public_html/`
- Delete existing contents (if any)
- Upload **entire contents** of `app/dist/`:
  - All files in `assets/`
  - `index.html`
  - `logo.jpeg`, `journal-logo.jpeg`
  - `_redirects`

### Step 4: Environment Setup on Hostinger
- Create `.env` file in `public_html/` with:
  ```
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_key
  ```

---

## 📁 Optional Cleanup (Local Only)

If you want to clean up your local machine, you can safely delete:

```powershell
# Remove editor config files (won't affect app)
Remove-Item -Path "C:\Users\Ganesh\Desktop\cornerstone\.vscode" -Recurse -Force
Remove-Item -Path "C:\Users\Ganesh\Desktop\cornerstone\.hintrc" -Force
Remove-Item -Path "C:\Users\Ganesh\Desktop\cornerstone\app\.vscode" -Recurse -Force

# Keep everything else for development
```

---

## ✅ Hostinger Destination Folder

**Upload to:** `public_html/` (root of your hosting account)

All files from `app/dist/` go directly into `public_html/` (not in a subfolder).

---

## 🔄 Deployment Workflow

```
Local Development
    ↓
npm run build (creates app/dist/)
    ↓
Upload app/dist/* to public_html/
    ↓
Hostinger serves your app
```

---

## 📝 Notes

- `.git/` folder should stay local (version control)
- Root `package.json` is kept for reference
- Only `app/dist/` contents are deployed
- `node_modules/` is never deployed (auto-installed from package.json)
- Environment variables configured separately on Hostinger
