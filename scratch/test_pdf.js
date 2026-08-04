import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';

const doc = new jsPDF();
doc.text('Hello World', 10, 10);
const pdfData = doc.output();
fs.writeFileSync('scratch/test.pdf', Buffer.from(doc.output('arraybuffer')));
console.log('PDF generado con éxito');
