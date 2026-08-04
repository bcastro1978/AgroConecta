import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const PRODUCER_AGRICULTURAL_PRODUCTS = [
  // 1. Cacao y Café (Agroexportación)
  { name: 'Cacao Sabor y Aroma (Seco)', category: 'Agroexportación - Cacao y Café', unit: 'Quintal' },
  { name: 'Cacao CCN-51 (Seco)', category: 'Agroexportación - Cacao y Café', unit: 'Quintal' },
  { name: 'Cacao en Baba (Fresco)', category: 'Agroexportación - Cacao y Café', unit: 'Quintal' },
  { name: 'Café Arábigo Fino de Aroma (Grano Seco)', category: 'Agroexportación - Cacao y Café', unit: 'Quintal' },
  { name: 'Café Robusta (Grano Seco)', category: 'Agroexportación - Cacao y Café', unit: 'Quintal' },

  // 2. Cereales y Granos
  { name: 'Arroz Flor (Pilado de Primera)', category: 'Cereales y Granos', unit: 'Quintal' },
  { name: 'Arroz en Cáscara / Paddy (Verde)', category: 'Cereales y Granos', unit: 'Quintal' },
  { name: 'Maíz Duro Amarillo (Seco y Limpio)', category: 'Cereales y Granos', unit: 'Quintal' },
  { name: 'Maíz Suave / Choclo Fresco', category: 'Cereales y Granos', unit: 'Quintal' },
  { name: 'Quinua Orgánica Certificada', category: 'Cereales y Granos', unit: 'Quintal' },

  // 3. Tubérculos y Raíces
  { name: 'Papa Chola (Calibre 1)', category: 'Tubérculos y Raíces', unit: 'Quintal' },
  { name: 'Papa Superchola (Primera)', category: 'Tubérculos y Raíces', unit: 'Quintal' },
  { name: 'Yuca Blanca / Amarilla', category: 'Tubérculos y Raíces', unit: 'Quintal' },
  { name: 'Camote Dulce', category: 'Tubérculos y Raíces', unit: 'Quintal' },

  // 4. Frutas y Plátano
  { name: 'Plátano Barraganete de Exportación', category: 'Frutas y Plátano', unit: 'Kilo' },
  { name: 'Banano Cavendish de Exportación', category: 'Frutas y Plátano', unit: 'Kilo' },
  { name: 'Aguacate Hass (Tipo Exportación)', category: 'Frutas y Plátano', unit: 'Kilo' },
  { name: 'Naranja Dulce Valencia', category: 'Frutas y Plátano', unit: 'Unidad' },
  { name: 'Piña MD2 Gold', category: 'Frutas y Plátano', unit: 'Unidad' },
  { name: 'Maracuyá Amarillo', category: 'Frutas y Plátano', unit: 'Quintal' },

  // 5. Hortalizas y Legumbres
  { name: 'Tomate Riñón Mayorista', category: 'Hortalizas y Legumbres', unit: 'Kilo' },
  { name: 'Cebolla Colorada Seca (Serrana/Costeña)', category: 'Hortalizas y Legumbres', unit: 'Quintal' },
  { name: 'Cebolla Larga / Rama', category: 'Hortalizas y Legumbres', unit: 'Quintal' },
  { name: 'Fréjol Rojo Canario (Seco)', category: 'Hortalizas y Legumbres', unit: 'Quintal' },
  { name: 'Pimiento Verde / Rojo', category: 'Hortalizas y Legumbres', unit: 'Kilo' },

  // 6. Pecuario y Palma
  { name: 'Leche Cruda de Vaca (Fría en Tanque)', category: 'Pecuario y Palma', unit: 'Litro' },
  { name: 'Aceite Crudo de Palma Africana', category: 'Pecuario y Palma', unit: 'Kilo' },
  { name: 'Fruto Verde de Palma Africana (RFF)', category: 'Pecuario y Palma', unit: 'Kilo' }
];

async function main() {
  console.log(`Insertando ${PRODUCER_AGRICULTURAL_PRODUCTS.length} productos agrícolas del Productor...`);

  const { data, error } = await supabase
    .from('products_catalog')
    .insert(PRODUCER_AGRICULTURAL_PRODUCTS)
    .select();

  if (error) {
    console.error('Error insertando productos del Productor:', error);
  } else {
    console.log(`✅ ${data.length} productos del Productor insertados exitosamente en products_catalog.`);
  }
}

main();
