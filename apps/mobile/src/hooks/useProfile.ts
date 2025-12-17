export function useProfile() {
  return {
    profile: null,
    loading: false,
    refetch: () => Promise.resolve(),
  };
}

export default useProfile;
