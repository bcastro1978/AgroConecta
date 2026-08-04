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

function applyPresentationTheme(doc, titleText, pageNumStr = "09 / 10") {
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

// ==========================================
// PDF 1: Tarea 1 - Cadena de Valor (Porter)
// ==========================================
function generateTarea1() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Cadena de Valor del \"Proyecto AgroConecta\" (Michael Porter)", "05 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text("Diseñada para reflejar las actividades necesarias para ofrecer monitoreo satelital, trazabilidad EUDR y mercado B2B de insumos.", 15, 33);

    const activities = [
        {
            title: "Logística de Entrada",
            cap: "Capacidad: Registro Multi-Perfil + Captura Geoespacial",
            desc: "• Registro de roles (Productor, Proveedor, Comprador)\n• Captura y validación de polígonos GeoJSON de parcelas\n• Georreferenciación de puntos de despacho y fincas"
        },
        {
            title: "Operaciones",
            cap: "Capacidad: Monitoreo Satelital + Diagnóstico IA",
            desc: "• Ingesta de datos Sentinel-2 y Sentinel-1 SAR\n• Cálculo automático de índices NDVI/NDMI/BSI\n• Diagnosticador agronómico multi-agente (LangGraph)"
        },
        {
            title: "Logística de Salida",
            cap: "Capacidad: Certificación EUDR + Publicación B2B",
            desc: "• Verificación de cero deforestación post-2020\n• Emisión de dictámenes y archivos GeoJSON TRACES NT\n• Despacho de ofertas y cotizaciones a productores"
        },
        {
            title: "Marketing y Ventas",
            cap: "Capacidad: Generación de Smart Leads B2B",
            desc: "• Matchmaking entre alertas fitosanitarias y catálogo B2B\n• Visualizador geográfico interactivo de demandas\n• Catálogo estructurado de insumos con Tier Pricing"
        },
        {
            title: "Servicio",
            cap: "Capacidad: Asistencia IA + Gestión Regional",
            desc: "• Asistente experto agronómico vía WhatsApp/Web\n• Alertas tempranas de severidad agronómica\n• Soporte territorial por Gerentes Regionales"
        }
    ];

    let startX = 15;
    const cardWidth = (width - 30 - (4 * 4)) / 5;

    activities.forEach((act, idx) => {
        const x = startX + idx * (cardWidth + 4);
        const y = 40;
        const cardHeight = 115;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');

        doc.setDrawColor(30, 63, 32);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'D');

        doc.setFillColor(30, 63, 32);
        doc.roundedRect(x, y, cardWidth, 12, 3, 3, 'F');
        doc.rect(x, y + 6, cardWidth, 6, 'F');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(act.title, x + 3, y + 8);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(197, 160, 89);
        const splitCap = doc.splitTextToSize(act.cap, cardWidth - 6);
        doc.text(splitCap, x + 3, y + 18);

        doc.setDrawColor(230, 230, 230);
        doc.line(x + 3, y + 26, x + cardWidth - 3, y + 26);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(50, 50, 50);
        const splitDesc = doc.splitTextToSize(act.desc, cardWidth - 6);
        doc.text(splitDesc, x + 3, y + 32);
    });

    const suppY = 160;
    doc.setFillColor(240, 235, 225);
    doc.roundedRect(15, suppY, width - 30, 30, 3, 3, 'F');
    doc.setDrawColor(197, 160, 89);
    doc.roundedRect(15, suppY, width - 30, 30, 3, 3, 'D');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 63, 32);
    doc.text("ACTIVIDADES DE SOPORTE Y HABILITADORES TRANSVERSALES:", 20, suppY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text("• INFRAESTRUCTURA: Supabase Auth, PostgreSQL con extensión PostGIS, Row Level Security (RLS), Vercel Hosting.", 20, suppY + 13);
    doc.text("• RECURSOS HUMANOS: Ingenieros Agrónomos, Gerentes Regionales (Branch Managers), Auditores Ambientales EUDR.", 20, suppY + 18);
    doc.text("• TECNOLOGÍA E IA: API Copernicus CDSE, Gemini 1.5/2.0 Pro, LangGraph Multi-Agent, React-Leaflet, Global Forest Watch API.", 20, suppY + 23);

    savePDF(doc, "Tarea_1_Cadena_de_Valor.pdf");
}

// ==========================================
// PDF 2: Tarea 2 - Flujos de Valor (SIN SOBREPOSICIÓN)
// ==========================================
function generateTarea2() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Flujos de Valor del \"Proyecto AgroConecta\"", "06 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Los flujos de valor representan la secuencia de actividades de extremo a extremo que crean y capturan valor para los clientes y el ecosistema.", 15, 33);

    const flows = [
        {
            type: "FLUJO CENTRAL (EXTERIOR)",
            name: "FC-01: Certificación de Trazabilidad EUDR y Cero Deforestación",
            trigger: "Productor o Comprador solicita la validación de cero deforestación para un lote de exportación a la Unión Europea.",
            steps: "Planificación de Lote  -->  Captura Poligonal GeoJSON  -->  Cruce de Capas Pre-2020  -->  Análisis Antideforestación IA  -->  Dictamen TRACES NT",
            output: "Cliente/Exportador recibe informe digital certificado y archivo GeoJSON validado para declaración aduanera en la UE."
        },
        {
            type: "FLUJO CENTRAL (EXTERIOR)",
            name: "FC-02: Conexión Comercial B2B e Insumos Inteligentes (Smart Leads)",
            trigger: "Detección satelital de anomalía fitosanitaria o déficit nutricional en una parcela agrícola.",
            steps: "Detección de Anomalía Satelital  -->  Matchmaking con Catálogo B2B  -->  Notificación a Proveedor Cercano  -->  Cotización y Despacho",
            output: "Productor recibe insumo oportuno para salvar su cosecha y Proveedor B2B concreta una venta geolocalizada."
        },
        {
            type: "FLUJO DE SOPORTE (INTERNO)",
            name: "FS-01: Telemetría y Conmutación Satelital Anti-Nubes (Sentinel 2/1 SAR)",
            trigger: "Ejecución programada de Cronjob batch para actualización periódica de parcelas registradas.",
            steps: "Descarga Óptica Sentinel-2  -->  Evaluación % Nubosidad  -->  Conmutación a Radar SAR Sentinel-1 (si >20% nubes)  -->  Matriz PostGIS",
            output: "Operación continua con series temporales NDVI/NDMI limpias y libres de vacíos por nubes."
        },
        {
            type: "FLUJO DE SOPORTE (INTERNO)",
            name: "FS-02: Verificación Administrativa y Registro Multi-Perfil de Usuarios",
            trigger: "Registro de un nuevo usuario (Productor, Proveedor B2B, Comprador) en la plataforma.",
            steps: "Formulario de Registro  -->  Inserción Supabase Auth  -->  Sincronización `profiles`  -->  Verificación Admin / RLS  -->  Redirección RBAC",
            output: "Gobernanza de la plataforma asegurada con perfiles validados y protección de la privacidad geoespacial."
        }
    ];

    let currentY = 40;

    flows.forEach((flow) => {
        const isCentral = flow.type.includes("CENTRAL");
        const cardHeight = 36;

        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, currentY, width - 30, cardHeight, 3, 3, 'F');

        doc.setFillColor(isCentral ? 30 : 197, isCentral ? 63 : 160, isCentral ? 32 : 89);
        doc.roundedRect(15, currentY, 4, cardHeight, 3, 3, 'F');
        doc.rect(17, currentY, 2, cardHeight, 'F');

        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.4);
        doc.roundedRect(15, currentY, width - 30, cardHeight, 3, 3, 'D');

        const badgeW = 55;
        const badgeX = width - 15 - badgeW - 3;
        doc.setFillColor(isCentral ? 30 : 245, isCentral ? 63 : 235, isCentral ? 32 : 215);
        doc.roundedRect(badgeX, currentY + 3, badgeW, 6, 2, 2, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(isCentral ? 255 : 120, isCentral ? 255 : 90, isCentral ? 255 : 10);
        doc.text(flow.type, badgeX + (badgeW / 2), currentY + 7.2, { align: 'center' });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(10, 10, 10);
        doc.text(flow.name, 23, currentY + 7.5);

        doc.setDrawColor(240, 240, 240);
        doc.line(23, currentY + 11, width - 20, currentY + 11);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 100, 100);
        doc.text("Desencadenante:", 23, currentY + 17);
        doc.text("Etapas del Flujo:", 23, currentY + 24);
        doc.text("Resultado (Output):", 23, currentY + 31);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(flow.trigger, 52, currentY + 17);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 63, 32);
        doc.text(flow.steps, 52, currentY + 24);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(flow.output, 52, currentY + 31);

        currentY += 40;
    });

    savePDF(doc, "Tarea_2_Flujos_de_Valor.pdf");
}

// ==========================================
// PDF 3: Tarea 3 - Etapas de Valor
// ==========================================
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

// ==========================================
// PDF 4: Tarea 4 - Mapa de Capacidades (Ajustado Sin Sobreposición)
// ==========================================
function generateTarea4() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Mapa de Capacidades del \"Proyecto AgroConecta\"", "09 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 63, 32);
    doc.text("Mapa de Capacidades - Plataforma AgroConecta", width / 2, 32, { align: 'center' });

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

        drawChevron(doc, mx, startY, mainW, 14, true, main.n1);

        const subW = (mainW - 2) / 2; // 25.5mm
        const subY = startY + 16;

        main.subs.forEach((sub, sIdx) => {
            const sx = mx + sIdx * (subW + 2);

            drawChevron(doc, sx, subY, subW, 11, false, sub.n2);

            const boxY = subY + 13;
            const boxH = 108;

            doc.setFillColor(252, 251, 248);
            doc.roundedRect(sx, boxY, subW, boxH, 2, 2, 'F');
            doc.setDrawColor(210, 205, 195);
            doc.setLineWidth(0.3);
            doc.roundedRect(sx, boxY, subW, boxH, 2, 2, 'D');

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

    const btmY = 177;
    doc.setFillColor(242, 238, 228);
    doc.roundedRect(marginX, btmY, totalW, 13, 2, 2, 'F');
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 63, 32);
    doc.text("El mapa de capacidades por niveles organiza las actividades generadoras de valor. Se analizan los flujos respondiendo: ¿Qué valor entregamos al cliente final?", width / 2, btmY + 8, { align: 'center' });

    savePDF(doc, "Tarea_4_Mapa_de_Capacidades.pdf");
}

// ==========================================
// PDF 5: Tarea 5 - Componentes Operativos
// ==========================================
function generateTarea5() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Los 4 Componentes Operativos de una Capacidad", "09 / 10");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Desglose detallado de los 4 componentes (Personas, Información, Procesos y Recursos) para las capacidades clave de AgroConecta.", 15, 33);

    const headers = [["Capacidad de Negocio (Nivel 2/3)", "👤 Personas (Roles)", "📄 Información (Datos)", "⚙️ Procesos Operativos", "🛠️ Recursos (Tecnología)"]];
    const data = [
        [
            "1.2 Conmutación Anti-Nubes SAR (Sentinel-1)",
            "• Ingeniero Agrónomo\n• Sistema Automatizado Batch",
            "• % Nubosidad AOI\n• Banda VV/VH Radar\n• Serie NDVI histórica",
            "1. Ingesta Sentinel-2\n2. Evaluación umbral 20% nubes\n3. Switch automático a Radar SAR\n4. Guardado PostGIS",
            "• API Copernicus CDSE\n• Sentinel-1/2\n• Worker Node.js\n• DB PostGIS"
        ],
        [
            "2.2 Dictamen Deforestación EUDR",
            "• Auditor Ambiental\n• Exportador Comprador\n• Productor Agrícola",
            "• Polígono GeoJSON\n• Cobertura Arbolada 2020\n• ID Parcela",
            "1. Delimitación de finca\n2. Superposición capas pre-2020\n3. Evaluación deforestación IA\n4. Emisión TRACES NT",
            "• Global Forest Watch API\n• PostGIS ST_Contains\n• Exporter GeoJSON/XML"
        ],
        [
            "3.1 Gestión de Catálogo B2B",
            "• Proveedor B2B Verificado\n• Gerente Comercial",
            "• Catálogo de Productos\n• Precios por Volumen\n• Stock disponible",
            "1. Registro de oferta B2B\n2. Clasificación Categoría/Tipo\n3. Configuración Tier Pricing\n4. Publicación en Feed",
            "• Tabla `products_catalog`\n• `marketplace_listings`\n• Componente `B2BListingForm`"
        ],
        [
            "3.2 Generación de Smart Leads",
            "• Proveedor B2B\n• Agente IA de Ventas",
            "• Alerta Fitosanitaria\n• Ubicación Geográfica\n• Insumo Sugerido",
            "1. Detección anomalía por satélite\n2. Matchmaking cantón/parroquia\n3. Notificación a proveedor\n4. Envío de Cotización",
            "• Agente LangGraph\n• Supabase Realtime\n• Leaflet Heatmap"
        ],
        [
            "6.1 Registro Multi-Perfil y RBAC",
            "• Productor / Proveedor\n• Administrador General",
            "• Email, Teléfono, Rol\n• Coordenadas ref\n• VerificationStatus",
            "1. Autenticación Supabase Auth\n2. Inserción espejo en `profiles`\n3. Asignación Claim RBAC\n4. Aplicación RLS Postgres",
            "• Supabase Auth\n• PostgreSQL RLS\n• React Context AuthProvider"
        ]
    ];

    autoTable(doc, {
        head: headers,
        body: data,
        startY: 38,
        margin: { left: 15, right: 15 },
        theme: 'grid',
        headStyles: {
            fillColor: [30, 63, 32],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8
        },
        bodyStyles: {
            fontSize: 7,
            textColor: [40, 40, 40]
        },
        columnStyles: {
            0: { cellWidth: 42, fontStyle: 'bold' },
            1: { cellWidth: 42 },
            2: { cellWidth: 42 },
            3: { cellWidth: 80 },
            4: { cellWidth: 61 }
        },
        alternateRowStyles: {
            fillColor: [248, 246, 240]
        }
    });

    savePDF(doc, "Tarea_5_Componentes_Operativos.pdf");
}

// ==========================================
// PDF 6: Tarea 6 - Oportunidades de Mejora
// ==========================================
function generateTarea6() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Oportunidades de Mejora en Capacidades de AgroConecta", "10 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Detección y priorización de brechas operativas para alinear las capacidades con los objetivos de sostenibilidad y escalabilidad.", 15, 33);

    const opports = [
        {
            num: "OM-01",
            title: "Automatización de Conmutación Radar SAR (Sentinel-1)",
            cap: "Capacidad Afectada: 1.2 Procesamiento Fitosanitario (Nivel 3: Conmutación Anti-Nubes)",
            gap: "Brecha Actual: En épocas de invierno o alta nubosidad (>20%), se pierden imágenes del sensor óptico Sentinel-2, interrumpiendo el monitoreo de los productores.",
            improv: "Mejora Propuesta: Algoritmo de fallback automático a microondas de Radar SAR (Sentinel-1 VV/VH) que penetra la cobertura nubosa para mantener la serie temporal NDVI ininterrumpida."
        },
        {
            num: "OM-02",
            title: "Engine de Matchmaking Predictivo de Smart Leads B2B",
            cap: "Capacidad Afectada: 3.2 Generación de Smart Leads (Nivel 3: Matchmaking Alertas-Ofertas)",
            gap: "Brecha Actual: La notificación de oportunidades comerciales a proveedores se realiza de forma reactiva mediante consultas de mapa manuales.",
            improv: "Mejora Propuesta: Cruce automatizado en tiempo real entre alertas fitosanitarias (ej. déficit de nitrógeno o brote de roya) y el catálogo de productos (`products_catalog`) del proveedor verificado más cercano."
        },
        {
            num: "OM-03",
            title: "Integración Directa con la API de TRACES NT (Unión Europea)",
            cap: "Capacidad Afectada: 2.2 Análisis Deforestación (Nivel 3: Dictamen TRACES NT)",
            gap: "Brecha Actual: El expediente GeoJSON de cero deforestación se descarga localmente para ser subido manualmente al sistema aduanero europeo.",
            improv: "Mejora Propuesta: Conectar la plataforma vía Webhook seguro con el portal oficial TRACES NT de la Comisión Europea para validar la declaración de la exportación con un solo clic."
        }
    ];

    let y = 40;

    opports.forEach(o => {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(15, y, width - 30, 42, 3, 3, 'F');
        doc.setDrawColor(197, 160, 89);
        doc.setLineWidth(0.5);
        doc.roundedRect(15, y, width - 30, 42, 3, 3, 'D');

        doc.setFillColor(197, 160, 89);
        doc.roundedRect(20, y + 5, 20, 8, 2, 2, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text(o.num, 23, y + 10.5);

        doc.setFontSize(11);
        doc.setTextColor(30, 63, 32);
        doc.text(o.title, 45, y + 11);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(120, 115, 110);
        doc.text(o.cap, 45, y + 16);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(180, 40, 40);
        doc.text(o.gap, 20, y + 25);

        doc.setTextColor(30, 120, 40);
        doc.text(o.improv, 20, y + 34);

        y += 46;
    });

    savePDF(doc, "Tarea_6_Oportunidades_de_Mejora.pdf");
}

// ==========================================
// PDF 7: Tarea 7 - Prototipado y Modelado Visual
// ==========================================
function generateTarea7() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    applyPresentationTheme(doc, "Modelado Visual y Prompt de Prototipado para AgroConecta", "10 / 10");

    const width = doc.internal.pageSize.getWidth();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Guía para transformar el mapa de capacidades en un prototipo digital funcional en herramientas de IA (Claude, Figma, Make, Google AI Studio).", 15, 33);

    const colW = (width - 35) / 2;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 40, colW, 140, 3, 3, 'F');
    doc.setDrawColor(30, 63, 32);
    doc.roundedRect(15, 40, colW, 140, 3, 3, 'D');

    doc.setFillColor(30, 63, 32);
    doc.roundedRect(15, 40, colW, 10, 3, 3, 'F');
    doc.rect(15, 45, colW, 5, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Estructura de Vistas ArchiMate (3 Capas)", 20, 46.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(197, 160, 89);
    doc.text("1. Capa de Estrategia (Strategy Layer):", 20, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text("• Flujos de Valor (Value Streams): FC-01, FC-02, FS-01, FS-02.\n• Capacidades de Negocio (Business Capabilities): Niveles 1, 2 y 3.", 20, 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(197, 160, 89);
    doc.text("2. Capa de Negocio (Business Layer):", 20, 76);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text("• Actores de Negocio: Productor, Proveedor B2B, Comprador EU, Admin.\n• Objetos de Negocio: Polígono GeoJSON, Alerta, Catálogo `products_catalog`.", 20, 82);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(197, 160, 89);
    doc.text("3. Capa de Aplicación (Application Layer):", 20, 96);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    doc.text("• Servicios de Aplicación: Supabase Auth, API Copernicus, LangGraph Agent.\n• Componentes de Software: `B2BListingForm`, `ProducerDashboard`, `B2BLeadsMap`.", 20, 102);

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20 + colW, 40, colW, 140, 3, 3, 'F');
    doc.setDrawColor(197, 160, 89);
    doc.roundedRect(20 + colW, 40, colW, 140, 3, 3, 'D');

    doc.setFillColor(197, 160, 89);
    doc.roundedRect(20 + colW, 40, colW, 10, 3, 3, 'F');
    doc.rect(20 + colW, 45, colW, 5, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Prompt Oficial de Prototipado con IA (Figma / Claude)", 25 + colW, 46.5);

    const promptText = `Genera un prototipo web interactivo para la plataforma AgroConecta basado en su Mapa de Capacidades de Negocio:

Módulos requeridos en el menú lateral:
1. Terminal Productor: Mapa Leaflet con polígonos GeoJSON, semáforo NDVI/NDMI y alertas fitosanitarias.
2. Mercado B2B (Terminal Proveedor): Catálogo de insumos agrupado por Categorías (Fertilizantes, Protección, Semillas, Riego, Maquinaria, Servicios) con selector de productos y formulario Tier Pricing.
3. Visor de Smart Leads: Mapa de calor georeferenciado con oportunidades comerciales generadas por IA satelital.
4. Módulo Trazabilidad EUDR: Verificador de polígonos contra deforestación con generador de dictamen para aduanas europeas.

Estilo de Diseño:
• Moderno, glassmorphism con verdes (#1E3F20), dorado (#C5A059) y cian.`;

    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(40, 40, 40);
    const splitPrompt = doc.splitTextToSize(promptText, colW - 10);
    doc.text(splitPrompt, 25 + colW, 56);

    savePDF(doc, "Tarea_7_Prototipado_y_Modelado.pdf");
}

generateTarea1();
generateTarea2();
generateTarea3();
generateTarea4();
generateTarea5();
generateTarea6();
generateTarea7();

console.log("🚀 Todos los 7 PDFs perfeccionados sin ninguna sobreposición se han generado exitosamente.");
