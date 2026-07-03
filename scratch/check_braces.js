import fs from 'fs';
const content = fs.readFileSync('src/components/dashboard/copernicus/AgronomicHealth.tsx', 'utf-8');
let openB = 0, closeB = 0;
let openP = 0, closeP = 0;
let openS = 0, closeS = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') openB++;
    if (content[i] === '}') closeB++;
    if (content[i] === '(') openP++;
    if (content[i] === ')') closeP++;
    if (content[i] === '[') openS++;
    if (content[i] === ']') closeS++;
}
console.log(`Braces: { ${openB} } ${closeB}`);
console.log(`Parens: ( ${openP} ) ${closeP}`);
console.log(`Square: [ ${openS} ] ${closeS}`);
if (openB !== closeB || openP !== closeP || openS !== closeS) {
    console.log("Mismatch detected!");
} else {
    console.log("All pairs match.");
}
