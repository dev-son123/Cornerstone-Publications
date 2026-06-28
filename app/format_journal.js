import fs from 'fs';
let code = fs.readFileSync('src/pages/Journal.tsx', 'utf8');

// Insert fadeInUp
code = code.replace("    const [view, setView]", "    const fadeInUp = {\n        hidden: { opacity: 0, y: 30 },\n        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: \"easeOut\" } }\n    };\n    const [view, setView]");

// Find the start of the 'home' view
const homeIdx = code.indexOf("{view === 'home' && (");
// Find the end of 'home' view (we will look for the specific </>)
const homeEndIdx = code.indexOf("</>", homeIdx);

if (homeIdx > -1 && homeEndIdx > -1) {
    let before = code.slice(0, homeIdx);
    let after = code.slice(homeEndIdx);
    let middle = code.slice(homeIdx, homeEndIdx);

    // Replace <section and </section> ONLY in the home tab
    middle = middle.replace(/<section\b([^>]*)>/g, '<motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp}$1>');
    middle = middle.replace(/<\/section>/g, '</motion.section>');

    code = before + middle + after;
    fs.writeFileSync('src/pages/Journal.tsx', code);
    console.log("Replaced Journal.tsx");
} else {
    console.log("Could not find 'home' view bounds");
}
