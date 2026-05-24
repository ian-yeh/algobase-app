export interface Country {
    code: string; // ISO 3166-1 alpha-2
    name: string;
    flag: string;
}

// Curated list of countries with active WCA scenes. Expand as needed.
export const COUNTRIES: Country[] = [
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "PL", name: "Poland", flag: "🇵🇱" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "KR", name: "South Korea", flag: "🇰🇷" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "AR", name: "Argentina", flag: "🇦🇷" },
    { code: "PH", name: "Philippines", flag: "🇵🇭" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
];

export const DEFAULT_COUNTRY = "CA";

export const findCountry = (code: string | null | undefined): Country | undefined =>
    COUNTRIES.find((c) => c.code === code);
