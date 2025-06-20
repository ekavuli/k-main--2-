// Updated interfaces for the application

export interface Person {
  id?: number;
  meno: string;
  priezvisko: string;
  datumNarodenia: string;
  telefon?: string; // Added optional telephone field
  email?: string; // Added optional email field
}

export interface Vaccine {
  id?: number;
  nazov: string;
  typ: string;
  vyrobca: string; // Added missing field used in AddVaccineComponent
  pocetDavok?: number; // Added optional total dose count
  intervalyDni?: number[]; // Added optional field for days between doses
}

export interface Vaccination {
  id?: number;
  osobaId: number;
  vakcinaId: number;
  datumAplikacie: string | Date;
  poradieDavky: number;
}

export interface VaccinationCampaign {
  id?: number;
  osobaId: number;
  vakcinaId: number;
  datumZaciatku: string | Date;
  pocetDavok: number;
  intervalyDni: number[];
  dokoncena?: boolean;
}

export interface VaccinationRecord {
  id: number;
  osobaId: number;
  vakcinaId: number;
  datumAplikacie: string;
  poradieDavky: number;
  osobaMeno: string;
  osobaPriezvisko: string;
  vakcinaNazov: string;
  vakcinaTyp: string;
}