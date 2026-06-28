const fs = require('fs');

function patchFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { search, replace } of replacements) {
    if (content.includes(search)) {
      content = content.replace(search, replace);
    } else {
      console.log(`Could not find target in ${filePath}:`, search.substring(0, 50));
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Patch Journal.tsx
patchFile('src/pages/Journal.tsx', [
  {
    search: "import { supabase } from '@/lib/supabase';",
    replace: "import { IntroSplash } from '@/components/IntroSplash';\nimport { supabase } from '@/lib/supabase';"
  },
  {
    search: '<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">\r\n            <style>{`',
    replace: '<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">\n            <IntroSplash />\n            <style>{`'
  },
  {
    search: '<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">\n            <style>{`',
    replace: '<div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">\n            <IntroSplash />\n            <style>{`'
  }
]);

// 2. Patch AdminDashboard.tsx
patchFile('src/components/admin/AdminDashboard.tsx', [
  {
    search: "import { Settings, LogOut, FileText, Users, ArrowLeft, Mail, Bell, Activity, PlusCircle, CheckCircle2, ChevronDown, ListStart, RefreshCw, BarChart3, TrendingUp, UserCheck, CheckCircle } from 'lucide-react';",
    replace: "import { IntroSplash } from '@/components/IntroSplash';\nimport { Settings, LogOut, FileText, Users, ArrowLeft, Mail, Bell, Activity, PlusCircle, CheckCircle2, ChevronDown, ListStart, RefreshCw, BarChart3, TrendingUp, UserCheck, CheckCircle } from 'lucide-react';"
  },
  {
    search: '<div className="min-h-screen bg-white/60 flex">\r\n            <MeshBackground />',
    replace: '<div className="min-h-screen bg-white/60 flex">\n            <IntroSplash />\n            <MeshBackground />'
  },
  {
    search: '<div className="min-h-screen bg-white/60 flex">\n            <MeshBackground />',
    replace: '<div className="min-h-screen bg-white/60 flex">\n            <IntroSplash />\n            <MeshBackground />'
  }
]);

// 3. Patch PhDMentorship.tsx
patchFile('src/pages/PhDMentorship.tsx', [
  {
    search: "import { useSearchParams } from 'react-router-dom';",
    replace: "import { IntroSplash } from '@/components/IntroSplash';\nimport { useSearchParams } from 'react-router-dom';"
  },
  {
    search: '<div className="min-h-screen bg-white">\r\n            {/* Hero Section */}',
    replace: '<div className="min-h-screen bg-white">\n            <IntroSplash />\n            {/* Hero Section */}'
  },
  {
    search: '<div className="min-h-screen bg-white">\n            {/* Hero Section */}',
    replace: '<div className="min-h-screen bg-white">\n            <IntroSplash />\n            {/* Hero Section */}'
  }
]);

console.log('All patches completed successfully.');
