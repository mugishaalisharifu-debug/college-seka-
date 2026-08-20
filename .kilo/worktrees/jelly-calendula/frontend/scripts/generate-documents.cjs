const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "public", "documents");
fs.mkdirSync(outDir, { recursive: true });

function buildPdf(title, lines) {
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const content = lines.map((l) => `BT /F1 11 Tf 54 ${720 - lines.indexOf(l) * 16} Td (${esc(l)}) Tj ET`).join("\n");
  const objects = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
  objects[3] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
  const stream = `${content}\n`;
  objects[4] = `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}endstream`;
  objects[5] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  for (let i = 1; i <= 5; i++) {
    offsets[i] = Buffer.byteLength(pdf, "utf8");
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += "xref\n0 6\n0000000000 65535 f \n";
  for (let i = 1; i <= 5; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const filePath = path.join(outDir, `${title}.pdf`);
  fs.writeFileSync(filePath, pdf, "utf8");
  console.log("Created:", path.relative(path.join(__dirname, ".."), filePath));
}

buildPdf("2026-academic-calendar", [
  "COLLEGE FONDATION SINA GERARD",
  "2026 ACADEMIC CALENDAR",
  "",
  "Term I: January 12 - April 17, 2026",
  "Term II: May 4 - August 7, 2026",
  "Term III: August 24 - November 27, 2026",
  "",
  "Holidays and key dates are published on the school website.",
]);

buildPdf("admission-application-form", [
  "COLLEGE FONDATION SINA GERARD",
  "ADMISSION APPLICATION FORM",
  "",
  "Student Full Name: ______________________________",
  "Date of Birth: __________________________________",
  "Education Level Applied: _________________________",
  "TVET Trade (if applicable): ______________________",
  "Parent / Guardian Name: _________________________",
  "Parent Contact: _________________________________",
  "",
  "Attach passport photo, birth certificate and last school report.",
]);

buildPdf("school-fee-structure-2026", [
  "COLLEGE FONDATION SINA GERARD",
  "SCHOOL FEE STRUCTURE 2026",
  "",
  "Nursery: 120,000 RWF per term",
  "Primary: 180,000 RWF per term",
  "Lower Secondary: 240,000 RWF per term",
  "TVET Programs: 320,000 RWF per term",
  "Boarding: 150,000 RWF per term",
  "Registration (one-time): 20,000 RWF",
  "",
  "Fees are payable at the Bursar's office.",
]);

buildPdf("school-rules-and-regulations", [
  "COLLEGE FONDATION SINA GERARD",
  "SCHOOL RULES AND REGULATIONS",
  "",
  "1. All learners must attend school daily and on time.",
  "2. School uniform must be worn at all times.",
  "3. Respect teachers, staff and fellow learners.",
  "4. Mobile phones are not allowed during lessons.",
  "5. School property must be handled with care.",
  "6. Discipline cases are handled by the Director of Discipline.",
]);

buildPdf("uniform-requirements-guide", [
  "COLLEGE FONDATION SINA GERARD",
  "UNIFORM REQUIREMENTS GUIDE",
  "",
  "Primary Uniform: White shirt, green shorts/skirt, black shoes.",
  "Secondary Uniform: White shirt, dark trousers/skirt, tie.",
  "TVET Uniform: Green overalls and safety boots.",
  "Sports Uniform: School branded t-shirt and shorts.",
  "",
  "All uniforms must be purchased from the school supplier.",
]);

console.log("All documents generated successfully.");

