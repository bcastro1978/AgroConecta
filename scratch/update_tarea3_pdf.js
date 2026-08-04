import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const outputDir = 'c:/PERSONAL/IA/AGROCONECTA/docs/pdf_entregables';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const artifactDir = 'C:/Users/boris/.gemini/antigravity-ide/brain/8e7a8287-3eab-4a4f-99c0-984537d1b1f1';
if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
}

function applyPresentationTheme(doc, titleText, pageNumStr = "08 / 10") {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(250, 248, 245);
    doc.rect(0, 0, width, height, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 115, 110);
    doc.text("E T A P A S   D E   V A L O R", 15, 12);
    doc.text(pageNumStr, width - 25, 12);

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 63, 32);
    doc.text(titleText, 15, 24);

    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.8);
    doc.line(15, 27, width - 15, 27);
}

function savePDF(doc, filename) {
    const p1 = path.join(outputDir, filename);
    const p2 = path.join(artifactDir, filename);
    const buffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(p1, buffer);
    fs.writeFileSync(p2, buffer);
    console.log(`✅ PDF guardado: ${filename}`);
}

function drawChevron(doc, x, y, w, h, isHighlighted, text) {
    const fillCol = isHighlighted ? [30, 63, 32] : [255, 255, 255];
    const textCol = isHighlighted ? [255, 255, 255] : [40, 40, 40];
    const borderCol = isHighlighted ? [30, 63, 32] : [200, 200, 200];

    doc.setFillColor(...fillCol);
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.4);

    const indent = 5;
    // Draw polygon using lines
    doc.lines(
        [
            [w - indent, 0],
            [indent, h / 2],
            [-indent, h / 2],
            [-(w - indent), 0],
            [indent, -h / 2]
        ],
        x, y, [1, 1], 'FD', true
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...textCol);

    const splitText = doc.splitTextToSize(text, w - indent - 2);
    const textY = y + (h / 2) - ((splitText.length - 1) * 2) + 1;
    doc.text(splitText, x + indent + 1, textY, { align: 'left' });
}

function generateTarea3() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Etapas de valor: Descomposición de los flujos", "08 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 63, 32);
    doc.text("Flujos y Etapas de Valor - AgroConecta", width / 2, 36, { align: 'center' });

    const flows = [
        { name: "Captura Geoespacial", highlight: false },
        { name: "Monitoreo Satelital", highlight: false },
        { name: "Diagnóstico IA", highlight: false },
        { name: "Certificación EUDR", highlight: true },
        { name: "Mercado B2B Leads", highlight: false }
    ];

    const startX = 35;
    const barY = 42;
    const chevW = 43;
    const chevH = 14;

    doc.setFillColor(235, 240, 235);
    doc.roundedRect(startX - 2, barY - 2, (chevW * 5) + 4, chevH + 4, 3, 3, 'F');

    flows.forEach((f, idx) => {
        const x = startX + idx * chevW;
        drawChevron(doc, x, barY, chevW, chevH, f.highlight, f.name);
    });

    const targetX = startX + 3 * chevW;
    doc.setDrawColor(30, 63, 32);
    doc.setLineWidth(0.6);
    doc.setLineDashPattern([1.5, 1.5], 0);

    doc.line(targetX + 5, barY + chevH, targetX - 25, 75);
    doc.line(targetX + chevW - 5, barY + chevH, targetX + chevW + 25, 75);
    doc.setLineDashPattern([], 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 63, 32);
    doc.text("Etapas de valor del flujo de valor (Certificación EUDR)", targetX + (chevW / 2), 72, { align: 'center' });

    const subStages = [
        {
            stage: "Delimitación GeoJSON",
            caps: ["Captura Poligonal", "Validación PostGIS"]
        },
        {
            stage: "Cruce Capas Pre-2020",
            caps: ["Consulta Capa Hansen", "Superposición Historical"]
        },
        {
            stage: "Dictamen TRACES NT",
            caps: ["Evaluación Deforestación IA", "Emisión XML/GeoJSON"]
        }
    ];

    const subW = 42;
    const subStartY = 77;
    const subStartX = targetX - 35;

    subStages.forEach((sub, idx) => {
        const sx = subStartX + idx * (subW + 6);
        
        drawChevron(doc, sx, subStartY, subW, 12, false, sub.stage);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(197, 160, 89);
        doc.text("Capacidades N3", sx + (subW / 2), subStartY + 17, { align: 'center' });

        sub.caps.forEach((c, cIdx) => {
            const cy = subStartY + 21 + (cIdx * 9);
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(sx + 2, cy, subW - 4, 7, 1.5, 1.5, 'F');
            doc.setDrawColor(210, 210, 210);
            doc.roundedRect(sx + 2, cy, subW - 4, 7, 1.5, 1.5, 'D');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.5);
            doc.setTextColor(50, 50, 50);
            doc.text(c, sx + (subW / 2), cy + 4.5, { align: 'center' });
        });
    });

    const leftX = 15;
    const leftY = 70;
    const leftW = 90;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(197, 160, 89);
    const leftTitle = doc.splitTextToSize("Las capacidades de negocio se desarrollan para permitir que la empresa realice las actividades que aportan valor a los clientes.", leftW);
    doc.text(leftTitle, leftX, leftY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    const leftDesc = doc.splitTextToSize("Asigne capacidades a las actividades de valor agregado en el flujo de valor. Las capacidades de negocio se encuentran en la capa superior de la arquitectura de negocio:", leftW);
    doc.text(leftDesc, leftX, leftY + 16);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 63, 32);
    doc.text("•  Son la referencia más estable para la planificación.", leftX, leftY + 32);
    doc.text("•  Hacen que la estrategia sea más tangible.", leftX, leftY + 38);
    doc.text("•  Superan los silos organizacionales entre áreas.", leftX, leftY + 44);

    const btmY = 125;
    doc.setFillColor(245, 242, 235);
    doc.roundedRect(15, btmY, width - 30, 60, 3, 3, 'F');
    doc.setDrawColor(197, 160, 89);
    doc.roundedRect(15, btmY, width - 30, 60, 3, 3, 'D');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 63, 32);
    doc.text("Descomposición Adicional: Flujo de Valor \"Conexión Comercial B2B (Smart Leads)\"", 22, btmY + 8);

    const b2bStages = [
        {
            stage: "1. Detección Anomalía",
            cap: "Capacidad: Monitoreo Satelital (N3: NDVI/NDMI)",
            desc: "Identificación por satélite de caídas anómalas de biomasa foliar."
        },
        {
            stage: "2. Matchmaking Geolocalizado",
            cap: "Capacidad: Mercado B2B (N3: Matchmaking Alertas)",
            desc: "Cruce automático con `products_catalog` de proveedores cercanos."
        },
        {
            stage: "3. Cotización y Despacho",
            cap: "Capacidad: Mercado B2B (N3: Tier Pricing / Quotes)",
            desc: "Emisión de propuestas comerciales por escala mediante `QuoteManager`."
        }
    ];

    const cardW = (width - 60) / 3;
    b2bStages.forEach((b, idx) => {
        const bx = 22 + idx * (cardW + 8);
        const by = btmY + 14;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(bx, by, cardW, 38, 2, 2, 'F');
        doc.setDrawColor(210, 210, 210);
        doc.roundedRect(bx, by, cardW, 38, 2, 2, 'D');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(30, 63, 32);
        doc.text(b.stage, bx + 4, by + 7);

        doc.setFontSize(7.5);
        doc.setTextColor(197, 160, 89);
        doc.text(b.cap, bx + 4, by + 14);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(60, 60, 60);
        const splitBDesc = doc.splitTextToSize(b.desc, cardW - 8);
        doc.text(splitBDesc, bx + 4, by + 22);
    });

    savePDF(doc, "Tarea_3_Etapas_de_Valor.pdf");
}

generateTarea3();
