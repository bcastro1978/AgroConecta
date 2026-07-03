import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../ui/button';
import { MapSelector } from '../ui/MapSelector';
import { ECUADOR_LOCATIONS } from '../../lib/locationData';
import { MapPin, Plus, Trash2, Home, Building2, Map as MapIcon } from 'lucide-react';
import type { ProviderBranch } from '../../types';

export const BranchManager = () => {
    const { profile } = useAuth();
    const [branches, setBranches] = useState<ProviderBranch[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [provinciaId, setProvinciaId] = useState('');
    const [cantonId, setCantonId] = useState('');
    const [parroquiaId] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [isMain, setIsMain] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (profile?.id) fetchBranches();
    }, [profile?.id]);

    const fetchBranches = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('provider_branches')
            .select('*')
            .eq('provider_id', profile?.id)
            .order('created_at', { ascending: false });

        if (!error && data) setBranches(data);
        setLoading(false);
    };

    const handleAddBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location || !profile?.id) return;
        
        setSubmitting(true);
        const { error } = await supabase.from('provider_branches').insert({
            provider_id: profile.id,
            branch_name: name,
            is_main: isMain,
            address,
            provincia: ECUADOR_LOCATIONS.provincias.find(p => p.id === provinciaId)?.name,
            canton: ECUADOR_LOCATIONS.cantones.find(c => c.id === cantonId)?.name,
            parroquia: ECUADOR_LOCATIONS.parroquias.find(p => p.id === parroquiaId)?.name,
            location_lat: location.lat,
            location_lng: location.lng
        });

        if (!error) {
            setAdding(false);
            setName('');
            setAddress('');
            setLocation(null);
            fetchBranches();
        }
        setSubmitting(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar esta ubicación?')) return;
        const { error } = await supabase.from('provider_branches').delete().eq('id', id);
        if (!error) fetchBranches();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Ubicaciones del Proveedor</h2>
                    <p className="text-gray-500 text-sm">Gestiona tu oficina matriz y sucursales para que los clientes te encuentren.</p>
                </div>
                {!adding && (
                    <Button onClick={() => setAdding(true)} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Nueva Ubicación
                    </Button>
                )}
            </div>

            {adding ? (
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <MapIcon className="w-5 h-5" /> Registrar Nueva Sede
                    </h3>
                    <form onSubmit={handleAddBranch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Nombre de la Sede (Ej: Matriz Quito, Sucursal Tulcán)</label>
                            <input
                                type="text"
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Provincia</label>
                            <select
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                                value={provinciaId}
                                onChange={(e) => setProvinciaId(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {ECUADOR_LOCATIONS.provincias.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cantón</label>
                            <select
                                required
                                disabled={!provinciaId}
                                className="mt-1 w-full px-3 py-2 border rounded-lg disabled:opacity-50"
                                value={cantonId}
                                onChange={(e) => setCantonId(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {ECUADOR_LOCATIONS.cantones.filter(c => c.provinciaId === provinciaId).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Dirección Exacta</label>
                            <input
                                type="text"
                                required
                                className="mt-1 w-full px-3 py-2 border rounded-lg"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Punto exacto en mapa</label>
                            <MapSelector 
                                value={location} 
                                onChange={(val) => setLocation(val)} 
                                searchQuery={name}
                            />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input
                                type="checkbox"
                                id="is_main"
                                checked={isMain}
                                onChange={(e) => setIsMain(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="is_main" className="text-sm font-medium text-gray-700">Esta es la oficina matriz</label>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setAdding(false)}>Cancelar</Button>
                            <Button type="submit" disabled={submitting || !location}>
                                {submitting ? 'Guardando...' : 'Guardar Ubicación'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {loading ? (
                        <div className="col-span-full py-12 text-center text-gray-400">Cargando ubicaciones...</div>
                    ) : branches.length === 0 ? (
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No tienes sucursales registradas aún.</p>
                            <Button variant="link" onClick={() => setAdding(true)}>Registra tu primera sede</Button>
                        </div>
                    ) : (
                        branches.map(branch => (
                            <div key={branch.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group hover:border-blue-200 transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-2 rounded-lg ${branch.is_main ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {branch.is_main ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(branch.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <h4 className="font-bold text-gray-900 leading-tight mb-1">{branch.branch_name}</h4>
                                <p className="text-xs text-blue-600 font-medium bg-blue-50 w-fit px-1.5 py-0.5 rounded mb-2">
                                    {branch.canton}, {branch.provincia}
                                </p>
                                <p className="text-sm text-gray-600 line-clamp-2 italic">"{branch.address}"</p>
                                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-400">Ref: {branch.location_lat?.toFixed(4)}, {branch.location_lng?.toFixed(4)}</span>
                                    {branch.is_main && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Matriz</span>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
