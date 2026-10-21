export function useQuery(opts: any): { data: any; isLoading: boolean; isObjectsLoading?: boolean } {
  return { data: [], isLoading: false, isObjectsLoading: false };
}
