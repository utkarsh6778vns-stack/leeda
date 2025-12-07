export interface Lead {
  name: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  description?: string;
}

export interface SearchState {
  category: string;
  city: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface LeadResponse {
  leads: Lead[];
  sources: GroundingSource[];
}
