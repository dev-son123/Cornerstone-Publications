// src/utils/documentTemplates.ts

export const getPaperTemplate = (): string => {
  return `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Paper Template – JCNAP</title>
<style>
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; margin: 2.5cm; line-height: 1.5; color: #000; }
  h1   { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 4pt; }
  h2   { font-size: 13pt; font-weight: bold; margin-top: 18pt; margin-bottom: 4pt; }
  h3   { font-size: 12pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
  p    { margin: 4pt 0; }
  .field { border-bottom: 1px solid #000; display: inline-block; min-width: 300px; } 
  .label { font-weight: bold; }
  .abstract-box { border: 1px solid #999; padding: 8pt 10pt; margin: 10pt 0; }
  .affil { font-size: 10pt; }
  .note  { font-size: 10pt; font-style: italic; }
</style>
</head>
<body>

<h1>Title of the Manuscript</h1>
<p style="text-align:center; font-size:11pt;">Author1, Author2, Author3</p>
<p class="affil" style="text-align:center;"><sup>1</sup>Authors' affiliation (Department, Institution, Place)</p>
<p class="affil" style="text-align:center;"><strong>Corresponding author</strong> – corresponding author name and email</p>

<hr style="margin: 16pt 0;" />

<div class="abstract-box">
<h2 style="margin-top:0;">Abstract</h2>
<p><strong>Background:</strong>&nbsp;</p>
<p><strong>Methods:</strong>&nbsp;</p>
<p><strong>Results:</strong>&nbsp;</p>
<p><strong>Conclusion:</strong>&nbsp;</p>
<p style="margin-top:10pt;"><strong>Keywords:</strong> keyword1, keyword2, keyword3, keyword4, keyword5</p>
</div>

<h2>1. INTRODUCTION</h2>
<p>&nbsp;</p>

<h2>2. NEED FOR THE STUDY</h2>
<p>&nbsp;</p>

<h2>3. AIM OF THE STUDY</h2>
<p>&nbsp;</p>

<h2>4. METHODOLOGY</h2>
<h3>Study Design and Setting</h3>
<p>&nbsp;</p>
<h3>Study Population and Eligibility Criteria</h3>
<p>&nbsp;</p>
<h3>Data Collection and Pre-test Assessment</h3>
<p>&nbsp;</p>
<h3>Sample Size and Sampling Method</h3>
<p>&nbsp;</p>
<h3>Ethical Considerations</h3>
<p>&nbsp;</p>

<h2>5. RESULTS</h2>
<h3>Side heading 1</h3>
<p>&nbsp;</p>
<p class="note">Fig. 1 XXXXXX</p>
<p class="note">Table 1. XXXXX</p>

<h3>Side heading 2</h3>
<p>&nbsp;</p>
<p class="note">Fig. 2 XXXX</p>
<p class="note">Table 2. XXXXX</p>

<h3>Side heading 3</h3>
<p>&nbsp;</p>

<h2>DISCUSSION</h2>
<p>&nbsp;</p>

<h2>CONCLUSION</h2>
<p>&nbsp;</p>

<hr style="margin: 16pt 0;" />

<p><strong>Funding:</strong> This research did not receive any funding from any government or private institutions.</p>
<p><strong>Data Availability:</strong> Data will be made available upon request made to the corresponding author.</p>
<p><strong>Patient Consent for Publication:</strong> Not applicable.</p>
<p><strong>Competing Interests:</strong> All authors confirm that they do not have any conflicts of interest to disclose.</p>

<h2>References</h2>
<p>1.</p>
<p>2.</p>
<p>3.</p>

</body></html>`;
};

export const getCopyrightTemplate = (): string => {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Transfer of Copyright Agreement</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 13.5pt;
    color: #000;
    padding: 3cm 3.5cm;
    line-height: 1.8;
  }
  h1 {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24pt;
  }
  p { margin-bottom: 16pt; text-align: justify; }
  .sig-section { margin-top: 40pt; }
  .sig-row {
    margin-bottom: 20pt;
  }
  @media print {
    body { padding: 2cm 2.5cm; }
    @page { size: A4; margin: 2cm; }
  }
</style>
</head>
<body>

<h1>Transfer of copyright agreement</h1>

<p>
  The article entitled ____________________________ is submitted for publication in the Journal of Clinical Nursing and Allied Health Practice (JCNAP). It has not been published before and is not under review in any other journal. It does not contain anything scandalous, obscene, defamatory, or against the law. I/We agree that any copies made will keep the original copyright notice. I/We confirm that I/We have written permission to use any text, tables, or figures taken from other copyrighted sources, and I/We will provide these permissions to JCNAP if asked.
</p>

<p>
  If the article is accepted, I/We, the author(s), agree to transfer and assign all copyright ownership, with all related rights, only to the Journal. After publication, the Journal will own the work, including: 1) copyright; 2) the right to give permission to republish the article in full or in part, with or without fee; 3) the right to make and distribute preprints or reprints and to translate the article into other languages for sale or free distribution; and 4) the right to republish the work in collections or in any other mechanical or electronic form.[1]
</p>

<p>
  The article will be published under the latest Creative Commons Attribution-NonCommercial-ShareAlike License, unless the Journal informs the author(s) otherwise in writing.[1]
</p>

<div class="sig-section">
  <div class="sig-row">Signature of author(s): ____________________________</div>
  <div class="sig-row">Name(s) and designation: __________________________</div>
  <div class="sig-row">Name of Institution/Organization: _________________</div>
</div>

<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
};

export const getConflictTemplate = (): string => {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Certificate of Conflict of Interest</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 14pt;
    color: #000;
    padding: 3cm 3.5cm;
    line-height: 1.8;
  }
  h1 {
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 24pt;
    text-decoration: underline;
  }
  p { margin-bottom: 16pt; text-align: justify; }
  .sig-section { margin-top: 40pt; }
  .sig-row {
    margin-bottom: 15pt;
  }
  @media print {
    body { padding: 2cm 2.5cm; }
    @page { size: A4; margin: 2cm; }
  }
</style>
</head>
<body>

<h1>Certificate of Conflict of Interest</h1>

<p>
  The article entitled _________________________________________________________________<br/>
  ________________________________________________________ is herewith submitted for<br/>
  publication in _________________________________________________ (Name of Journal).<br/>
  It has not been published before, and it is not under consideration for publication in any other<br/>
  journal (s).
</p>

<p>
  I/We certify that I/We have obtained written permission for the use of text, tables, and/or
  illustrations from any copyrighted source(s), and I/We declare no conflict of interest.
</p>

<div class="sig-section">
  <div class="sig-row">Signature of author(s): _____________________________________________</div>
  <div class="sig-row">Name(s) and designation: ___________________________________________</div>
  <div class="sig-row">Name(s) of Institution/Organization: _________________________________</div>
</div>

<script>window.onload = function(){ window.print(); }<\/script>
</body></html>`;
};
