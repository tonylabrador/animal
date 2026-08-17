export interface BilingualText {
  en: string;
  zh: string;
}

export interface SourceMetadata {
  authority?: string;
  url?: string;
  release?: string;
  status?: string;
  checked_at: string;
}

export interface SourcedBilingualText extends BilingualText {
  source_keys: string[];
}

export interface QuickFact {
  key: string;
  label: BilingualText;
  value: BilingualText;
  source_keys: string[];
}

export interface Adaptation {
  title: BilingualText;
  detail: BilingualText;
  source_keys: string[];
}

export interface RichContent {
  quick_facts: QuickFact[];
  life_cycle_and_reproduction: SourcedBilingualText;
  adaptations: Adaptation[];
  ecological_role: SourcedBilingualText;
  conservation_and_threats: {
    population_trend: "increasing" | "stable" | "decreasing" | "unknown";
    threats: BilingualText;
    actions: BilingualText;
    source_keys: string[];
  };
  identification: {
    key_features: BilingualText;
    similar_species: BilingualText;
    source_keys: string[];
  };
  communication_and_senses: SourcedBilingualText;
  seasonal_calendar: SourcedBilingualText;
  relationship_with_humans: SourcedBilingualText;
  evolution: SourcedBilingualText;
  field_signs: SourcedBilingualText;
  did_you_know: Array<{
    text: BilingualText;
    source_keys: string[];
  }>;
  class_specific: Array<{
    title: BilingualText;
    content: BilingualText;
    source_keys: string[];
  }>;
}

export interface Animal {
  content_version?: 2;
  content_review?: {
    factual_qc: "pending" | "source-checked";
    bilingual_qc: "pending" | "line-by-line-reviewed";
    reviewed_at?: string;
    reviewer?: string;
    notes?: string;
  };
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
    range_review?: {
      display_mode: "verified-polygon" | "legacy-polygon-retained" | "representative-point";
      previous_result: "not-applicable" | "retained" | "replaced" | "removed-unverified";
      source_keys: string[];
      comparison_en: string;
      comparison_zh: string;
      checked_at: string;
    };
  };

  encyclopedia: {
    anatomy: BilingualText & { source_keys?: string[] };
    ecology_and_behavior: BilingualText & { source_keys?: string[] };
    habitat_and_distribution: BilingualText & { source_keys?: string[] };
  };

  rich_content?: RichContent;

  image?: string | null;

  image_attribution?: {
    source: string;
    source_url: string | null;
    attribution: string | null;
    license_code: string | null;
    review_status: string;
  };

  sources?: Record<string, SourceMetadata | SourceMetadata[]>;

  legal_status?: {
    code: string;
    en: string;
    zh: string;
  };
}
