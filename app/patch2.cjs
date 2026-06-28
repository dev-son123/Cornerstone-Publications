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

patchFile('src/pages/PhDMentorship.tsx', [
  {
    search: "// import { useNavigate } from 'react-router-dom';\r\nimport { Card, CardContent } from '@/components/ui/card';",
    replace: "import { useSearchParams } from 'react-router-dom';\nimport { Card, CardContent } from '@/components/ui/card';"
  },
  {
    search: "import { useMeta } from '@/hooks/useMeta';\nimport { IntroSplash } from '@/components/IntroSplash';\nimport { AdvancedNav } from '@/components/ui/advanced-nav';",
    replace: "import { useMeta } from '@/hooks/useMeta';\nimport { IntroSplash } from '@/components/IntroSplash';\nimport { AdvancedNav } from '@/components/ui/advanced-nav';"
  },
  {
    search: "import { motion } from 'framer-motion';\r\n\r\nexport default function PhDMentorship() {\r\n    const fadeInUp: any = {",
    replace: "import { motion } from 'framer-motion';\nimport { useMeta } from '@/hooks/useMeta';\nimport { IntroSplash } from '@/components/IntroSplash';\nimport { AdvancedNav } from '@/components/ui/advanced-nav';\n\nexport default function PhDMentorship() {\n    const [searchParams] = useSearchParams();\n    const isStandalone = searchParams.get('standalonevkjrrjonwrorn') === 'true';\n    useMeta({ title: 'PhD Mentorship Program', description: '3–4 year structured PhD mentoring' });\n    const fadeInUp: any = {"
  },
  {
    search: '<div className="min-h-screen bg-white">\r\n            {/* Hero Section */}',
    replace: '<div className="min-h-screen bg-white">\n            <IntroSplash />\n            {!isStandalone && <AdvancedNav />}\n            {/* Hero Section */}'
  },
  {
    search: '{/* ── Footer ────────────────────────────────────────────────────────── */}\r\n            <footer className="w-full bg-[#0b1120] text-gray-400 py-12 relative overflow-hidden">',
    replace: '{/* ── Footer ────────────────────────────────────────────────────────── */}\n            {!isStandalone && (<footer className="w-full bg-[#0b1120] text-gray-400 py-12 relative overflow-hidden">'
  },
  {
    search: '                </div>\r\n            </footer>\r\n        </div>',
    replace: '                </div>\n            </footer>)}\n        </div>'
  }
]);

console.log('patched PhDMentorship!');
