export interface Country {
    Country: string;
    CountryCode: string;
    Date?: string;
    NewConfirmed: number;
    NewDeaths: number;
    NewRecovered: number;
    Slug: string;
    TotalConfirmed: number;
    TotalDeaths: number;
    TotalRecovered: number;
    Population: number;
};

export interface CountryResponseData {
    CountryCode: string;
    CountryData: {
        Cases: number;
        Data: string;
    }
};