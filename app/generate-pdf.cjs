const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('public/cct-syllabus.pdf'));

doc.font('Helvetica-Bold').fontSize(16).text('SYLLABUS: BASIC PHYSICS', { align: 'center' });
doc.fontSize(14).text('COURSE CONTENT', { align: 'center' });
doc.moveDown(2);

doc.font('Helvetica-Bold').fontSize(12).text('Block 1: Basic physics');
doc.font('Helvetica').text('Unit 1: States of matter');
doc.text('Unit 2: Changes of state');
doc.text('Unit 3: Gas behavior under changing conditions');
doc.text('Gas laws: Boyles / Charles / Gay Lussais, Daltons laws & application', { indent: 20 });
doc.text('Unit 4: Fluid dynamics');
doc.text('Concepts of pressure, volume, flow, Temperature, Humidity Measurements – units & devices Introduction to Medical term describing normal & abnormal process', { indent: 20 });
doc.moveDown();

doc.font('Helvetica-Bold').text('Block 2: Medical Gases:');
doc.font('Helvetica').text('Unit 1: Characteristics of Medical gases');
doc.text('Unit 2: Storage of medical gases');
doc.text('Section 1: Cylinders, Liquid gas storage, oxygen concentrator', { indent: 20 });
doc.text('Unit 3: Distribution of regulation of medical gases');
doc.text('Section 1: Piped distribution system', { indent: 20 });
doc.moveDown(2);

doc.font('Helvetica-Bold').text('Reference Books');
doc.font('Helvetica').text('1. Davis P: Basic Physics and Measurement Anesthesia.');
doc.text('2. Thayalan K: Bio Medical Physics for Nurses.');
doc.text('3. Kacmarek R. M: Egan’s Fundamentals of Respiratory Care. Elsevier(2013)');

doc.end();
console.log('PDF generated at public/cct-syllabus.pdf');
