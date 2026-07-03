import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { MapPin, AlertTriangle, CheckCircle, Search, Droplets, Sprout, Tractor } from 'lucide-react';

interface Lead {
  id: string;
  parcel_id: string;
  category_match: string;
  pre_score: number;
  province: string;
  parish: string;
  crop_type: string;
  diagnosis_summary: string;
  parcel_geometry: any;
  status: string;
}

const MapUpdater = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export function B2BLeadsMap() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('b2b_smart_leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) {
      setLeads(data);
    }
    setLoading(false);
  };

  const filteredLeads = filterCategory === 'All' 
    ? leads 
    : leads.filter(l => l.category_match.toLowerCase().includes(filterCategory.toLowerCase()));

  const getGeometryCenter = (geom: any): [number, number] | null => {
    if (!geom || !geom.coordinates || geom.coordinates.length === 0) return null;
    const coords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
    if (!coords || coords.length === 0) return null;
    return [coords[0][1], coords[0][0]]; // [lat, lng]
  };

  const getCategoryIcon = (cat: string) => {
    if (cat.toLowerCase().includes('riego') || cat.toLowerCase().includes('hídrico')) return <Droplets className="w-5 h-5 text-blue-500" />;
    if (cat.toLowerCase().includes('maquinaria')) return <Tractor className="w-5 h-5 text-amber-600" />;
    return <Sprout className="w-5 h-5 text-green-500" />;
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-gray-50">
      {/* Sidebar de Leads */}
      <div className="w-1/3 min-w-[350px] bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10 relative">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-green-700 text-[#0A0A0A]">
          <h2 className="text-2xl font-bold mb-2">B2B Lead Radar</h2>
          <p className="text-emerald-100 text-sm">Descubre oportunidades agronómicas geolocalizadas detectadas por LangGraph.</p>
        </div>
        
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-2">
           <Search className="w-5 h-5 text-gray-400" />
           <select 
             className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700"
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
           >
             <option value="All">Todas las Categorías</option>
             <option value="Insumos">Insumos (Fertilizantes/Agroquímicos)</option>
             <option value="Riego">Sistemas de Riego</option>
             <option value="Maquinaria">Maquinaria y Servicios</option>
           </select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
             <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
          ) : filteredLeads.length === 0 ? (
             <p className="text-center text-gray-500 mt-8">No se encontraron oportunidades en esta categoría.</p>
          ) : (
            filteredLeads.map((lead) => (
              <div 
                key={lead.id} 
                onClick={() => setSelectedLead(lead)}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${selectedLead?.id === lead.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(lead.category_match)}
                    <span className="font-semibold text-gray-800">{lead.crop_type}</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">Score: {lead.pre_score}</span>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{lead.diagnosis_summary}</p>
                
                <div className="flex items-center text-xs text-gray-500 font-medium bg-gray-100 p-2 rounded">
                  <MapPin className="w-3 h-3 mr-1" />
                  {lead.parish}, {lead.province}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mapa Principal */}
      <div className="w-2/3 h-full relative">
        <MapContainer 
          center={[-1.8312, -78.1834]} 
          zoom={7} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {selectedLead && getGeometryCenter(selectedLead.parcel_geometry) && (
             <MapUpdater center={getGeometryCenter(selectedLead.parcel_geometry)} />
          )}

          {filteredLeads.map(lead => {
            const geom = lead.parcel_geometry;
            if (!geom || !geom.coordinates) return null;
            
            const positions = geom.type === 'Polygon' 
              ? geom.coordinates[0].map((c: any) => [c[1], c[0]] as [number, number])
              : geom.coordinates[0][0].map((c: any) => [c[1], c[0]] as [number, number]);

            return (
              <Polygon 
                key={lead.id}
                positions={positions} 
                pathOptions={{ 
                  color: selectedLead?.id === lead.id ? '#10b981' : '#f59e0b',
                  fillOpacity: selectedLead?.id === lead.id ? 0.6 : 0.3,
                  weight: selectedLead?.id === lead.id ? 3 : 1
                }}
                eventHandlers={{
                  click: () => setSelectedLead(lead)
                }}
              >
                {selectedLead?.id === lead.id && (
                  <Popup>
                    <div className="p-2 w-64">
                      <h3 className="font-bold text-lg mb-1">{lead.crop_type}</h3>
                      <p className="text-sm text-gray-600 mb-2"><strong>Problema detectado:</strong> {lead.diagnosis_summary}</p>
                      <button className="w-full bg-[#1E3F20] text-[#FAF9F7] py-2 rounded font-medium shadow-sm hover:bg-[#152C16] transition">
                        Adquirir Contacto
                      </button>
                    </div>
                  </Popup>
                )}
              </Polygon>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
