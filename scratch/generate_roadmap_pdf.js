import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

const outputDir = 'c:/PERSONAL/IA/AGROCONECTA/docs/pdf_entregables';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const artifactDir = 'C:/Users/boris/.gemini/antigravity-ide/brain/8e7a8287-3eab-4a4f-99c0-984537d1b1f1';
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

function applyPresentationTheme(doc, titleText, pageNumStr = "10 / 10") {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(250, 248, 245);
    doc.rect(0, 0, width, height, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(120, 115, 110);
    doc.text("P P R E N D H O   •   M O D E L A D O   E M P R E S A R I A L   ( U T P L )", 15, 11);
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
    const buffer = Buffer.from(doc.output('arraybuffer'));
    const p2 = path.join(artifactDir, filename);
    fs.writeFileSync(p2, buffer);

    const p1 = path.join(outputDir, filename);
    try {
        fs.writeFileSync(p1, buffer);
        console.log(`✅ PDF guardado: ${filename}`);
    } catch (e) {
        const altFile = filename.replace('.pdf', '_Detallada.pdf');
        const pAlt = path.join(outputDir, altFile);
        fs.writeFileSync(pAlt, buffer);
        console.log(`✅ PDF guardado como alternativo (por archivo en uso): ${altFile}`);
    }
}

function generateRoadmapPDF() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Hoja de Ruta de Despliegue Operativo: AgroConecta (100% Funcional)", "10 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text("Plan de ejecución a 12 meses (1,000 agricultores y 100 proveedores B2B en Ecuador) con descripción detallada y costo por responsable.", 15, 30);

    const headers = [["Fase & Período", "Actividad & Descripción Detallada", "Responsables (Roles)", "Costo por Responsable", "Presupuesto Total"]];
    const data = [
        [
            "FASE 1 (M1-M3)\nHardening Técnico\ny Algoritmos\n\nPresupuesto:\n$12,000 USD",
            "1.1 Algoritmo Anti-Nubes SAR Sentinel-1 (Fallback radar si nubes >20%)\n1.2 Integración Webhook API TRACES NT UE (Dictámenes EUDR)\n1.3 Motor Matchmaking Predictivo Smart Leads IA (LangGraph)\n1.4 Pruebas RLS Supabase, PostGIS & Pentest Ciberseguridad",
            "• Lead Data Engineer\n• Backend Dev (PostGIS)\n• Sr. Fullstack Dev\n• Lead Auditor EUDR\n• AI Engineer (LangGraph)\n• Data Engineer\n• Cloud Security Architect\n• QA / Devops Engineer",
            "• $1,800 USD\n• $700 USD\n• $2,200 USD\n• $1,300 USD\n• $2,000 USD\n• $1,000 USD\n• $2,000 USD\n• $1,000 USD",
            "1.1 $2,500 USD\n1.2 $3,500 USD\n1.3 $3,000 USD\n1.4 $3,000 USD\n\nTotal Fase 1:\n$12,000 USD"
        ],
        [
            "FASE 2 (M4-M6)\nPiloto & Campo\n(3 Provincias)\n\nPresupuesto:\n$15,000 USD",
            "2.1 Piloto Carchi, Los Ríos y Manabí (150 productores, 20 B2B)\n2.2 Capacitación & Georreferenciación GeoJSON (3 agrónomos campo)\n2.3 Onboarding 20 Casas Comerciales B2B (Tier Pricing en catálogo)\n2.4 Optimización UX/UI Móvil & WhatsApp Webhook Bot conversacional",
            "• Product Owner / PM\n• Gerentes Regionales\n• Agrónomos Campo (3)\n• Coord. Capacitación\n• Líder Comercial B2B\n• Exec. Cuentas B2B\n• Frontend React Dev\n• Diseñador UI/UX",
            "• $2,200 USD\n• $1,800 USD\n• $3,000 USD ($1k c/u)\n• $1,500 USD\n• $2,200 USD\n• $1,300 USD\n• $1,800 USD\n• $1,200 USD",
            "2.1 $4,000 USD\n2.2 $4,500 USD\n2.3 $3,500 USD\n2.4 $3,000 USD\n\nTotal Fase 2:\n$15,000 USD"
        ],
        [
            "FASE 3 (M7-M10)\nEscalamiento Red\n(1000 / 100)\n\nPresupuesto:\n$28,000 USD",
            "3.1 Marketing Digital Geolocalizado (Geofencing zonas agrícolas)\n3.2 Fuerza de Ventas B2B (Afiliación intensiva de 80 proveedores B2B)\n3.3 Convenios Institucionales (MAG, ANECACAO, ANECAFE, AEBE)\n3.4 Días de Campo Agrotech (Enrolamiento de 1,000 agricultores en 8 prov.)",
            "• Growth & Mktg Lead\n• Creador & Trafficker\n• Sup. Ventas B2B\n• Asesores Campo (3)\n• CEO / Dir. General\n• Asesor Legal Convenios\n• Gerentes Regionales\n• Logística & Promotores",
            "• $4,500 USD\n• $3,500 USD\n• $3,500 USD\n• $6,500 USD\n• $2,500 USD\n• $1,500 USD\n• $3,500 USD\n• $2,500 USD",
            "3.1 $8,000 USD\n3.2 $10,000 USD\n3.3 $4,000 USD\n3.4 $6,000 USD\n\nTotal Fase 3:\n$28,000 USD"
        ],
        [
            "FASE 4 (M11-M12)\nMonetización &\nGobernanza\n\nPresupuesto:\n$10,000 USD",
            "4.1 Suscripciones B2B (Freemium/Pro/Enterprise) & QuoteManager\n4.2 Auditoría 1,000+ Ha cero deforestación (Carpetas digitales EUDR)\n4.3 Alianza Microcréditos Verdes Bancarios (BanEcuador/Cooperativas)",
            "• CFO / Dir. Financiero\n• Backend Billing Dev\n• Lead Auditor EUDR\n• Especialista Datos GIS\n• CEO / Dir. Alianzas\n• Analista Riesgos/Datos",
            "• $1,500 USD\n• $1,000 USD\n• $2,500 USD\n• $1,500 USD\n• $2,200 USD\n• $1,300 USD",
            "4.1 $2,500 USD\n4.2 $4,000 USD\n4.3 $3,500 USD\n\nTotal Fase 4:\n$10,000 USD"
        ]
    ];

    autoTable(doc, {
        head: headers,
        body: data,
        startY: 33,
        margin: { left: 15, right: 15 },
        theme: 'grid',
        headStyles: {
            fillColor: [30, 63, 32],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5
        },
        bodyStyles: {
            fontSize: 6.8,
            textColor: [40, 40, 40]
        },
        columnStyles: {
            0: { cellWidth: 38, fontStyle: 'bold' },
            1: { cellWidth: 105 },
            2: { cellWidth: 48 },
            3: { cellWidth: 46 },
            4: { cellWidth: 30, fontStyle: 'bold' }
        },
        alternateRowStyles: {
            fillColor: [248, 246, 240]
        }
    });

    const btmY = 176;
    doc.setFillColor(242, 238, 228);
    doc.roundedRect(15, btmY, width - 30, 14, 2, 2, 'F');
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 63, 32);
    doc.text("PRESUPUESTO GLOBAL TOTAL ESTIMADO (12 MESES): $65,000 USD", 20, btmY + 6);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text("Desglose detallado por actividad y honorarios/costos de responsabilidad para la plena operatividad de AgroConecta en Ecuador.", 20, btmY + 10.5);

    savePDF(doc, "Tarea_8_Hoja_de_Ruta_Despliegue.pdf");
}

generateRoadmapPDF();
