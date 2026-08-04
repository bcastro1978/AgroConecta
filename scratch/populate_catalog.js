import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const catalogItems = [
  // 1. Fertilizantes y Nutrición Vegetal
  { name: 'Urea Granulada 46% N (Fertilizante Edáfico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Nitrato de Amonio (Fertilizante Edáfico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Fosfato Diamónico DAP 18-46-0 (Fertilizante Edáfico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Muriato de Potasio KCl 60% (Fertilizante Edáfico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'NPK Complejo 15-15-15 (Fertilizante Edáfico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Compost Orgánico Certificado (Abono Orgánico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Humus de Lombriz Purificado (Abono Orgánico)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Biochar Agrícola Acondicionador de Suelos', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Quintal' },
  { name: 'Fertilizante Foliar Quelatado (Zn + B + Mg)', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Litro' },
  { name: 'Bioestimulante de Aminoácidos y Algas Ascophyllum', category: 'Fertilizantes y Nutrición Vegetal', unit: 'Litro' },

  // 2. Protección de Cultivos (Agroquímicos y Biológicos)
  { name: 'Mancozeb 80% WP (Fungicida Preventivo)', category: 'Protección de Cultivos', unit: 'Kilo' },
  { name: 'Azoxystrobin + Difenoconazol (Fungicida Sistémico)', category: 'Protección de Cultivos', unit: 'Litro' },
  { name: 'Trichoderma harzianum Biológico (Fungicida Biológico)', category: 'Protección de Cultivos', unit: 'Kilo' },
  { name: 'Abamectina 1.8% EC (Acaricida / Insecticida)', category: 'Protección de Cultivos', unit: 'Litro' },
  { name: 'Chlorpyrifos 48% EC (Insecticida de Choque)', category: 'Protección de Cultivos', unit: 'Litro' },
  { name: 'Bacillus thuringiensis (Insecticida Biológico)', category: 'Protección de Cultivos', unit: 'Kilo' },
  { name: 'Glifosato 480 SL (Herbicida Sistémico No Selectivo)', category: 'Protección de Cultivos', unit: 'Litro' },
  { name: 'Paraquat 200 SL (Herbicida de Contacto)', category: 'Protección de Cultivos', unit: 'Litro' },
  { name: '2,4-D Amina (Herbicida Selectivo Hoja Ancha)', category: 'Protección de Cultivos', unit: 'Litro' },
  { name: 'Trampas de Feromonas para Picudo del Cacao/Palma', category: 'Protección de Cultivos', unit: 'Unidad' },

  // 3. Semillas y Material Vegetativo Certificado
  { name: 'Semilla Certificada Maíz Híbrido High Yield', category: 'Semillas y Material Vegetativo', unit: 'Kilo' },
  { name: 'Semilla Certificada Arroz SICA-8', category: 'Semillas y Material Vegetativo', unit: 'Quintal' },
  { name: 'Varetas/Injertos Cacao Nacional Arriba Fino de Aroma', category: 'Semillas y Material Vegetativo', unit: 'Unidad' },
  { name: 'Clones de Cacao CCN-51 Certificados en Bolsa', category: 'Semillas y Material Vegetativo', unit: 'Unidad' },
  { name: 'Plántulas de Café Arábigo Variedad Sarchimor', category: 'Semillas y Material Vegetativo', unit: 'Unidad' },
  { name: 'Semilla Certificada de Papa Súper Chola', category: 'Semillas y Material Vegetativo', unit: 'Quintal' },

  // 4. Riego y Control Hídrico
  { name: 'Manguera de Riego por Goteo Autocompensada 16mm (Rollo 100m)', category: 'Riego y Control Hídrico', unit: 'Unidad' },
  { name: 'Goteros Integrados Botón 4L/h', category: 'Riego y Control Hídrico', unit: 'Unidad' },
  { name: 'Bomba de Agua Diésel 10 HP Alta Presión', category: 'Riego y Control Hídrico', unit: 'Unidad' },
  { name: 'Filtro de Anillos 2" para Sistemas de Riego', category: 'Riego y Control Hídrico', unit: 'Unidad' },

  // 5. Maquinaria, Equipos y Herramientas
  { name: 'Motofumigadora de Espalda a Motor 25L', category: 'Maquinaria y Herramientas', unit: 'Unidad' },
  { name: 'Bomba de Espalda Manual 20L Ergónoma', category: 'Maquinaria y Herramientas', unit: 'Unidad' },
  { name: 'Machete Agrícola de Corte 24" Acero Forjado', category: 'Maquinaria y Herramientas', unit: 'Unidad' },
  { name: 'Tijeras de Poda Profesional para Cacao/Café', category: 'Maquinaria y Herramientas', unit: 'Unidad' },
  { name: 'Servicio Alquiler Tractor 90HP con Arado (por día)', category: 'Maquinaria y Herramientas', unit: 'Unidad' },

  // 6. Servicios Agronómicos y Tecnología Satelital
  { name: 'Servicio de Aspersión con Dron Agrícola (por Ha)', category: 'Servicios Agronómicos y Tecnología', unit: 'Unidad' },
  { name: 'Mapeo Multiespectral Dron NDVI/NDRE (por Ha)', category: 'Servicios Agronómicos y Tecnología', unit: 'Unidad' },
  { name: 'Análisis Químico Completo de Suelos y Foliares', category: 'Servicios Agronómicos y Tecnología', unit: 'Unidad' },
  { name: 'Certificación y Georreferenciación Deforestación Cero EUDR', category: 'Servicios Agronómicos y Tecnología', unit: 'Unidad' }
];

async function main() {
  console.log(`Insertando ${catalogItems.length} productos en products_catalog...`);

  // Limpiar catálogo previo si existieran restos
  await supabase.from('products_catalog').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { data, error } = await supabase.from('products_catalog').insert(catalogItems).select();

  if (error) {
    console.error('Error insertando productos:', error);
  } else {
    console.log(`✅ ${data.length} productos insertados exitosamente en el catálogo.`);
  }
}

main();
