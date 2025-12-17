export function useCategories() {
  return {
    categories: [],
    loading: false,
    refresh: () => Promise.resolve(),
  };
}

export default useCategories;
