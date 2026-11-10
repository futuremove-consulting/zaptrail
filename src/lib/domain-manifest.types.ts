/**
 * DomainPackUIManifest — describes how a domain pack surfaces itself in the UI.
 * Core rule: this interface lives in src/lib/ and is UI-only.
 */
export interface ExtraColumn {
  key: string;
  label?: string;
  header?: string;
  type?: 'currency' | 'currency_brl' | 'text' | 'number' | 'badge' | 'date';
  format?: 'currency' | 'currency_brl' | 'text' | 'number' | 'badge' | 'date';
  path?: string;
  accessor?: string;
  sortable?: boolean;
}

export interface ExtraFilter {
  key: string;
  label: string;
  type: 'select' | 'range' | 'text';
  options?: Array<{ value: string; label: string }>;
}

export interface DomainPackUIManifest {
  domain_key: string;
  display_name: string;
  icon: string;
  description: string;
  official?: boolean;
  available?: boolean;
  coming_soon?: boolean;
  labels: {
    opportunity: string;
    participant: string;
    intent: string;
    entity: string;
  };
  extra_columns: ExtraColumn[];
  extra_filters: ExtraFilter[];
  intent_labels: Record<string, string>;
  opportunity_labels: Record<string, string>;
  role_labels: Record<string, string>;
}
