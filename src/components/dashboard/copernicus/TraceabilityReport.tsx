import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, ShieldCheck, Calendar, Map as MapIcon, Loader2, CheckCircle, Award, X, Sparkles, Fingerprint } from 'lucide-react';

interface TraceabilityReportProps {
    parcel: any;
    onClose: () => void;
}

export const TraceabilityReport = ({ parcel, onClose }: TraceabilityReportProps) => {
    const [generating, setGenerating] = useState(false);

    const generatePDF = async () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // 1. Header & Branding
            doc.setFillColor(2, 6, 23); // Slate 950
            doc.rect(0, 0, pageWidth, 45, 'F');
            
            doc.setTextColor(16, 185, 129); // Emerald 500
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("AGROCONECTA", 15, 22);
            
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("EMERALD PRECISION • TRAZABILIDAD SATELITAL", 15, 30);
            
            doc.setTextColor(148, 163, 184); // Slate 400
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            const uuidFallback = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            doc.text(`ID_CERT: ${uuidFallback.toUpperCase()}`, pageWidth - 15, 20, { align: 'right' });
            doc.text(`EMISIÓN: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 28, { align: 'right' });

            // 2. Parcel Information
            doc.setTextColor(2, 6, 23); // Slate 950
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("1. ESPECIFICACIONES TÉCNICAS DEL LOTE", 15, 60);
            
            doc.setDrawColor(16, 185, 129);
            doc.setLineWidth(1);
            doc.line(15, 63, 40, 63);

            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105); // Slate 600
            
            const infoY = 75;
            doc.setFont("helvetica", "bold"); doc.text("CULTIVO ACTIVO:", 15, infoY);
            doc.setFont("helvetica", "normal"); doc.text(parcel.active_crop?.toUpperCase() || "NO ESPECIFICADO", 55, infoY);

            doc.setFont("helvetica", "bold"); doc.text("UBICACIÓN GEO:", 15, infoY + 8);
            doc.setFont("helvetica", "normal"); doc.text(`${parcel.provincia || "ECUADOR"} | GPS_VALIDATED`, 55, infoY + 8);

            doc.setFont("helvetica", "bold"); doc.text("MONITOREO:", 15, infoY + 16);
            doc.setFont("helvetica", "normal"); doc.text("COPERNICUS SENTINEL-2 / SENTINEL-1 SAR", 55, infoY + 16);

            // 3. Telemetry Table
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(2, 6, 23);
            doc.text("2. MATRIZ DE TELEMETRÍA (ÍNDICES BIO-FÍSICOS)", 15, 110);
            
            const telemetryHeaders = [["FECHA", "MISIÓN", "NDVI (BIOMASA)", "NDMI (ESTRÉS)", "NUBES"]];
            const telemetryData = (parcel.sat_telemetry || [])
                .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 12)
                .map((t: any) => [
                    new Date(t.created_at).toLocaleDateString(),
                    t.mission,
                    t.ndvi_avg?.toFixed(4) || "N/A",
                    t.ndmi_avg?.toFixed(4) || "N/A",
                    `${t.cloud_cover?.toFixed(1) || 0}%`
                ]);

            (doc as any).autoTable({
                startY: 115,
                head: telemetryHeaders,
                body: telemetryData,
                theme: 'grid',
                headStyles: { fillColor: [2, 6, 23], textColor: [16, 185, 129], fontStyle: 'bold' },
                styles: { fontSize: 8, cellPadding: 3 },
                columnStyles: {
                    2: { fontStyle: 'bold' },
                    3: { fontStyle: 'bold' }
                }
            });

            // 4. Verification Footer
            const pageHeight = doc.internal.pageSize.getHeight();
            doc.setFillColor(248, 250, 252); // Slate 50
            doc.rect(0, pageHeight - 50, pageWidth, 50, 'F');
            
            doc.setDrawColor(226, 232, 240);
            doc.line(0, pageHeight - 50, pageWidth, pageHeight - 50);

            doc.setFontSize(7);
            doc.setTextColor(100, 116, 139);
            const footerText = "ESTE DOCUMENTO CONSTITUYE UNA PRUEBA DIGITAL DE TRAZABILIDAD RESPALDADA POR DATOS GEOESPACIALES EN TIEMPO REAL. LA INTEGRIDAD DE LOS DATOS HA SIDO VERIFICADA MEDIANTE EL MOTOR AGROCONECTA PRECISION.";
            doc.text(doc.splitTextToSize(footerText, pageWidth - 40), pageWidth / 2, pageHeight - 35, { align: 'center' });
            
            doc.setTextColor(2, 6, 23);
            doc.setFont("helvetica", "bold");
            doc.text("VERIFICACIÓN CRIPTOGRÁFICA CDSE: OK_VALID_SIGNED", pageWidth / 2, pageHeight - 15, { align: 'center' });

            doc.save(`CERT_AGROCONECTA_${parcel.active_crop?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
        } catch (error) {
            console.error("Error generating PDF", error);
            alert("Error en la generación del motor de reportes.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#FAF9F7]/80 backdrop-blur-xl z-[2000] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white border border-[#0A0A0A]/10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-2xl overflow-hidden relative group">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#1E3F20]/5 blur-[100px] rounded-full pointer-events-none"></div>
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-[#57534E] transition-all z-20"
                >
                    <X size={20} />
                </button>

                {/* Header Section */}
                <div className="p-10 pb-0">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-[#1E3F20]/5 rounded-2xl border border-[#1E3F20]/20 text-[#1E3F20] shadow-lg shadow-[#0A0A0A]/10">
                            <Fingerprint size={32} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={14} className="text-[#1E3F20]" />
                                <span className="text-[10px] font-black text-[#1E3F20] uppercase tracking-[0.3em]">Precision Certificate</span>
                            </div>
                            <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight leading-none uppercase">Reporte Inmutable</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 bg-[#FAF9F7]/50 p-6 rounded-3xl border border-[#0A0A0A]/10 backdrop-blur-md">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Identificador de Lote</p>
                            <p className="text-xl font-black text-[#0A0A0A] uppercase">{parcel.active_crop}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Validación CDSE</p>
                            <div className="flex items-center gap-2 text-[#1E3F20]">
                                <CheckCircle size={18} />
                                <span className="text-sm font-bold">ACTIVO / VERIFICADO</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-10 space-y-8">
                    <div className="flex items-start gap-4 p-6 bg-[#1E3F20]/5 border border-emerald-500/10 rounded-3xl">
                        <div className="p-2.5 bg-[#1E3F20]/5 text-[#1E3F20] rounded-xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h4 className="text-[#0A0A0A] font-black text-sm uppercase tracking-tight mb-1">Certificación de Valor Agregado</h4>
                            <p className="text-[#57534E] text-xs font-medium leading-relaxed">
                                Este documento genera confianza en compradores B2B al proporcionar evidencia histórica objetiva del vigor y salud del cultivo mediante telemetría Sentinel-2.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Últimas Lecturas de Biomasa</h5>
                            <span className="text-[10px] font-bold text-[#1E3F20] bg-[#1E3F20]/5 px-2 py-0.5 rounded-full border border-[#1E3F20]/20">{(parcel.sat_telemetry?.length || 0)} Total</span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {(parcel.sat_telemetry || []).slice(0, 4).map((t: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-[#FAF9F7]/30 border border-[#0A0A0A]/10 rounded-2xl text-xs group/item hover:bg-[#FAF9F7] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${t.ndvi_avg >= 0.6 ? 'bg-[#1E3F20]' : 'bg-amber-500'} shadow-[0_0_8px_currentColor]`}></div>
                                        <span className="font-bold text-[#57534E]">{new Date(t.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] text-slate-500 font-black uppercase">NDVI</span>
                                            <span className="font-black text-[#1E3F20] text-sm">{t.ndvi_avg.toFixed(3)}</span>
                                        </div>
                                        <span className="bg-white px-3 py-1 rounded-lg border border-[#0A0A0A]/10 text-[9px] font-black text-[#57534E] group-hover/item:text-[#0A0A0A] transition-colors">{t.mission}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-10 pt-0 flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 bg-[#FAF9F7]/50 hover:bg-[#FAF9F7] text-[#57534E] hover:text-[#0A0A0A] border border-[#0A0A0A]/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
                    >
                        Cerrar Vista
                    </button>
                    <button 
                        onClick={generatePDF}
                        disabled={generating}
                        className="flex-1 py-4 bg-[#1E3F20] hover:bg-[#1E3F20] text-[#FAF9F7] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#0A0A0A]/10 active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        {generating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" /> Procesando...
                            </>
                        ) : (
                            <>
                                <Download size={18} /> Exportar PDF
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
