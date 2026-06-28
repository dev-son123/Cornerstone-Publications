const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('public/mlt-syllabus.pdf'));

doc.font('Helvetica-Bold').fontSize(16).text('SYLLABUS: PHYSICS FOR MLT', { align: 'center' });
doc.fontSize(14).text('(Medical Laboratory Technology)', { align: 'center' });
doc.moveDown(2);

const sections = [
    {
        title: 'General Laboratory Organization',
        content: `1. Knowledge of lab organization, reporting and recording procedures.
2. Ethics of laboratory practice, confidentiality of reports. Medico legal aspects of record keeping.
3. Method of collection transport, packing and storing of specimens, the concept of pre analytical, analytical and post analytical.
4. Importance of labeling and identification.
5. Preparations of solutions.
6. Laboratory glassware and its uses.
7. Concept of universal precautions, biohazard.
8. Handling of waste, waste segregation and management including disposal.
9. Laboratory accidents, prevention, first aid.
10. Stores supplies, indenting shelf life, grades of chemicals.
11. Basic mathematics and biostatistics, mean, median, SD, CV.
12. Structure of bacteria, growth, nutrition, microbes in our environment and normal flora including concepts of pathogenicity.
13. Aseptic techniques, sterilization, and disinfection.
14. Composition of blood normal values, and normal morphology.
15. Different types of blood samples.
16. Anticoagulants, mechanism of action and uses.
17. Routine stores used in the laboratory.
18. Principles and methods of ensuring of quality assistance in the laboratory.`
    },
    {
        title: 'Practicals',
        content: `1. Venipuncture and collection of blood samples
2. Preparation of blood films
3. Staining of blood smears
4. Manual count of blood cells
5. Weighing of chemicals and preparation of solution
6. Preparation of cleaning solution for glassware, cleaning glassware drying and sterilization.
7. Pipettes types, clearing, sterilization, uses, calibration, pasts, pipettes.
8. Identification of bacteria, bacterial growth.`
    },
    {
        title: 'PHYSICS',
        content: `Course description: at the end of the course the student should have a basic understanding of physics as applicable to his feature work in the laboratory. He will also be familiar with the functions and maintenance of commonly used laboratory equipment and instruments.\n\n` + 
`I. Review of physics
Balance physical & chemical balance. Sensitivity of balance use and care of the balance, mass -volume- specific gravity- units and measurements- properties of matter - viscosity of both fluids- diffusion and osmosis -dynamics- motion -types centripetal force and centrifugal force. application centrifuge principle and parts applications in medicine preventive maintenance ph meter parts and principle cell counter - basic principle.\n\n` +
`II. HEAT:
Basic concept of quantity of heat. Definition and measurement of above concept of temperature thermometry, thermostat, thermocouple relevant to clinical laboratory, thermal capacity specific heat capacity, calorimetric techniques calorific values of food and fuel kinetic theory of gases- assumptions. Applications laws of thermodyanamics water bath- parts, care and usage. Incubator- parts, preventive maintenance and use of refrigerators techniques. Types of refrigerators- cooling ;cycle production of low temperature vapour absorption change of stage, latent heat; cooling by evaporation.\n\n` +
`III. Light and optics:
While light color spectrum wavelength frequency dispersion reflection refraction critical angle - total internal reflection. Lasers -types- focal length-magnification power- spherici and chromatic -filters- spectrometer- principle and parts- applications microscopes.
Types of microscopes-simple- compound -phase contrast-polarizing -fluorescent- darl fieldfield-electron microscope-parts and care of the microscope.\n\n` +
`IV. sound:
Production and propagation - velocity wave length frequency- ultrasound- properties & problems and application in clinical field.\n\n` +
`V. Review of electricity and electronics:
Electricity:
Determination of power, energy, AC & DC current- resistance - volts,- ohm's law- cycles - earthing- fuse- transformers types- tum ratio- transformers and stabilizers- uninterrupted power supply(UPS)- electrolysis- basic concept. electrolytes application in medicine, distillation apparatus parts and principle. Medical electronics semi conductors- principles of diodes- rectifiers- oscillators- photoelectric emission integrated circuits.\n\n` +
`VI. Radioactivity:
Basis of radioactivity decay constant decay series - artificial radioactivity - radioisotopes-isotopes used in medicine - blood indicator (Gamma chamber)-detectors- non chamber- GM count scintillation chamber -liquid scintillation -electromagnetic radiations - spectrum - ionizing radiation - types charged. Particle radiation - electron beam- its properties - radiation protection- and basic principles of radiation protection- personnel monitoring devices (TLD, Film badge).`
    },
    {
        title: 'SECOND YEAR: Histopathology and cytology techniques',
        content: `Course description: at the end of the course the student will able to fix, process, embed tissues and make sections for microsection studies. He will also be competent to make routine cytological preparation.\n\n` +
`Theory:
• Introduction to histopathological techniques
• Reception of specimens.
• Fixation-formalin fixation. Tissue processing and embedding.
• Section cutting.
• Mounting and staining
• Theory of H&E staining.
• Theory of EM fixing, processing&cutting`
    }
];

sections.forEach(sec => {
    doc.font('Helvetica-Bold').fontSize(14).text(sec.title);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11).text(sec.content, { align: 'justify', lineGap: 3 });
    doc.moveDown(2);
});

doc.end();
console.log('PDF generated at public/mlt-syllabus.pdf');
