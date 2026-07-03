export type UserRole = 'Productor' | 'Comprador' | 'Admin' | 'Transportista' | 'Proveedor';
export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected';
export type ListingStatus = 'Active' | 'Sold' | 'Paused' | 'Reserved';
export type NegotiationStatus = 'Pending' | 'Counter_Offered' | 'Accepted' | 'Rejected';

export interface UserProfile {
    id: string;
    full_name: string;
    email?: string;
    phone_number?: string;
    role: UserRole;
    verification_status: VerificationStatus;
    location_ref_lat?: number;
    location_ref_lng?: number;
    address?: string;
    provincia?: string;
    canton?: string;
    parroquia?: string;
    created_at: string;
    branches?: ProviderBranch[];
}

export interface ProviderBranch {
    id: string;
    provider_id: string;
    branch_name: string;
    is_main: boolean;
    address?: string;
    provincia?: string;
    canton?: string;
    parroquia?: string;
    location_lat?: number;
    location_lng?: number;
    created_at: string;
}

export interface VerificationDocument {
    id: string;
    user_id: string;
    doc_type: 'Cedula' | 'Titulo_Propiedad' | 'RUC';
    file_url: string;
    uploaded_at: string;
}

export interface ProductCatalog {
    id: string;
    name: string;
    category: string;
    unit: 'Quintal' | 'Litro' | 'Kilo' | 'Arroba' | 'Unidad';
    image_url?: string;
}

export interface TierPricing {
    min_qty: number;
    price: number;
}

export interface MarketplaceListing {
    id: string;
    producer_id: string;
    product_id: string;
    quantity: number;
    price_unit: number;
    status: ListingStatus;
    description?: string;
    min_order_quantity: number;
    is_negotiable: boolean;
    tier_pricing: TierPricing[];
    created_at: string;

    // Joined relations for UI
    product?: ProductCatalog;
    producer?: UserProfile;
}

export interface Negotiation {
    id: string;
    listing_id: string;
    buyer_id: string;
    producer_id: string;
    proposed_quantity: number;
    proposed_price: number;
    message?: string;
    status: NegotiationStatus;
    created_at: string;
    updated_at: string;

    // Joined relations for UI
    listing?: MarketplaceListing;
    buyer?: UserProfile;
}
