import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

const outputDir = 'c:/PERSONAL/IA/AGROCONECTA/docs/pdf_entregables';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const artifactDir = 'C:/Users/boris/.gemini/antigravity-ide/brain/8e7a8287-3eab-4a4f-99c0-984537d1b1f1';
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function applyPresentationTheme(doc, titleText, pageNumStr = "09 / 10") {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(250, 248, 245);
    doc.rect(0, 0, width, height, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 115, 110);
    doc.text("M A P A   D E   C A P A C I D A D E S   D E   N E G O C I O", 15, 11);
    doc.text(pageNumStr, width - 25, 11);

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.setTextColor(30, 63, 32);
    doc.text(titleText, 15, 21);

    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.8);
    doc.line(15, 24, width - 15, 24);
}

function savePDF(doc, filename) {
    const p1 = path.join(outputDir, filename);
    const p2 = path.join(artifactDir, filename);
    const buffer = Buffer.from(doc.output('arraybuffer'));
    fs.writeFileSync(p1, buffer);
    fs.writeFileSync(p2, buffer);
    console.log(`✅ PDF guardado: ${filename}`);
}

function drawChevron(doc, x, y, w, h, isDark, text) {
    const fillCol = isDark ? [30, 63, 32] : [240, 240, 235];
    const textCol = isDark ? [255, 255, 255] : [30, 30, 30];
    const borderCol = isDark ? [30, 63, 32] : [200, 200, 200];

    doc.setFillColor(...fillCol);
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);

    const indent = 4;
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
    doc.setFontSize(isDark ? 7 : 6);
    doc.setTextColor(...textCol);

    const splitText = doc.splitTextToSize(text, w - indent - 2);
    const lineSpacing = isDark ? 2.3 : 2.0;
    const textY = y + (h / 2) - ((splitText.length - 1) * (lineSpacing / 2)) + 0.5;

    splitText.forEach((line, idx) => {
        doc.text(line, x + (w / 2) + (indent / 2), textY + (idx * lineSpacing), { align: 'center' });
    });
}

function generateTarea4() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Mapa de Capacidades del \"Proyecto AgroConecta\"", "09 / 10");

    const width = doc.internal.pageSize.getWidth();

    // Center Title Banner
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 63, 32);
    doc.text("Mapa de Capacidades - Plataforma AgroConecta", width / 2, 32, { align: 'center' });

    // 5 Main Columns (Nivel 1)
    const mainCols = [
        {
            n1: "Monitoreo\nSatelital",
            subs: [
                { n2: "Adquisición\nDatos", n3: ["Ingesta Sentinel-2", "Ingesta SAR S-1"] },
                { n2: "Procesamiento\nNDVI", n3: ["Cálculo NDVI/NDMI", "Conmutación SAR"] }
            ]
        },
        {
            n1: "Trazabilidad\nEUDR",
            subs: [
                { n2: "Captura\nGeoespacial", n3: ["Dibujo GeoJSON", "Validación PostGIS"] },
                { n2: "Análisis\nDeforestación", n3: ["Cruce Pre-2020", "Dictamen TRACES"] }
            ]
        },
        {
            n1: "Mercado B2B\n& Leads",
            subs: [
                { n2: "Catálogo\nInsumos", n3: ["Categorías Insumos", "Tier Pricing"] },
                { n2: "Smart\nLeads", n3: ["Matchmaking IA", "Geolocalización"] }
            ]
        },
        {
            n1: "Asistencia\nIA",
            subs: [
                { n2: "Diagnóstico\nPlagas", n3: ["Agente Plagas", "Agente Nutrición"] },
                { n2: "Consultoría\nWeb/WA", n3: ["Asistente WhatsApp", "Alertas Severidad"] }
            ]
        },
        {
            n1: "Gobernanza\n& RBAC",
            subs: [
                { n2: "Identidad\ny Roles", n3: ["Registro Perfiles", "Control RBAC 4 Roles"] },
                { n2: "Privacidad\nRLS", n3: ["Políticas RLS Postgres", "Ofuscación Fincas"] }
            ]
        }
    ];

    const marginX = 12;
    const startY = 38;
    const totalW = width - (marginX * 2); // 273mm
    const mainW = (totalW - (4 * 2)) / 5; // 53mm

    mainCols.forEach((main, mIdx) => {
        const mx = marginX + mIdx * (mainW + 2);

        // Nivel 1 Chevron (Dark Green)
        drawChevron(doc, mx, startY, mainW, 14, true, main.n1);

        // 2 Sub-Columns (Nivel 2)
        const subW = (mainW - 2) / 2; // 25.5mm
        const subY = startY + 16;

        main.subs.forEach((sub, sIdx) => {
            const sx = mx + sIdx * (subW + 2);

            // Nivel 2 Chevron (Light/White)
            drawChevron(doc, sx, subY, subW, 11, false, sub.n2);

            // Nivel 3 Container Box
            const boxY = subY + 13;
            const boxH = 108;

            doc.setFillColor(252, 251, 248);
            doc.roundedRect(sx, boxY, subW, boxH, 2, 2, 'F');
            doc.setDrawColor(210, 205, 195);
            doc.setLineWidth(0.3);
            doc.roundedRect(sx, boxY, subW, boxH, 2, 2, 'D');

            // Stacked N3 Items inside
            let itemY = boxY + 4;
            sub.n3.forEach((n3Item) => {
                const itemH = 22;
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(sx + 1.2, itemY, subW - 2.4, itemH, 1.5, 1.5, 'F');
                doc.setDrawColor(220, 220, 220);
                doc.setLineWidth(0.3);
                doc.roundedRect(sx + 1.2, itemY, subW - 2.4, itemH, 1.5, 1.5, 'D');

                doc.setFont("helvetica", "bold");
                doc.setFontSize(6);
                doc.setTextColor(30, 30, 30);

                const splitItem = doc.splitTextToSize(n3Item, subW - 4);
                const textPosY = itemY + (itemH / 2) - ((splitItem.length - 1) * 1.6) + 0.8;
                splitItem.forEach((line, lIdx) => {
                    doc.text(line, sx + (subW / 2), textPosY + (lIdx * 2.2), { align: 'center' });
                });

                itemY += itemH + 4;
            });
        });
    });

    // Bottom Explanatory Text Banner matching Slide 9 bottom
    const btmY = 177;
    doc.setFillColor(242, 238, 228);
    doc.roundedRect(marginX, btmY, totalW, 13, 2, 2, 'F');
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 63, 32);
    doc.text("El mapa de capacidades por niveles organiza las actividades generadoras de valor. Se analizan los flujos respondiendo: ¿Qué valor entregamos al cliente final?", width / 2, btmY + 8, { align: 'center' });

    savePDF(doc, "Tarea_4_Mapa_de_Capacidades.pdf");
}

generateTarea4();
