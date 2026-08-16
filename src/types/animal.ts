interface BilingualText {
  en: string;
  zh: string;
}

export interface Animal {
  id: string;
  name_zh: string;
  name_en: string;
  scientific_name: string;
  ui_tags: string[];

  taxonomy: {
    kingdom: BilingualText;
    phylum: BilingualText;
    class: BilingualText;
    order: BilingualText;
    family: BilingualText;
    genus: BilingualText;
  };

  conservation_status: {
    code: "EX" | "EW" | "CR" | "EN" | "VU" | "NT" | "LC" | "DD" | "NE";
    en: string;
    zh: string;
    note_en?: string;
    note_zh?: string;
  };

  description: BilingualText;

  habitat: {
    text_en: string;
    text_zh: string;
    map_coordinates: [number, number];
    map_zoom_level: number;
    global_distribution_polygons: [number, number][][];
  };

  encyclopedia: {
    anatomy: BilingualText;
    ecology_and_behavior: BilingualText;
    habitat_and_distribution: BilingualText;
  };

  image?: string | null;

  image_attribution?: {
    source: string;
    source_url: string | null;
    attribution: string | null;
    license_code: string | null;
    review_status: string;
  };

  sources?: Record<string, {
    authority?: string;
    url?: string;
    release?: string;
    status?: string;
    checked_at: string;
  }>;

  legal_status?: {
    code: string;
    en: string;
    zh: string;
  };
}
