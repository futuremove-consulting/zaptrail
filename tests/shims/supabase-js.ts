export interface SupabaseClient {
  from(table: string): any;
}

export function createClient(_url: string, _key: string): SupabaseClient {
  return {
    from: () => ({}),
  };
}
