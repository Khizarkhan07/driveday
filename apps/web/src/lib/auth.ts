import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginRequest, SignupRequest, User } from "@motorcover/shared-types";
import { api } from "./api";

const ME_QUERY_KEY = ["auth", "me"];

export function useCurrentUser() {
  return useQuery<{ user: User } | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      try {
        return await api.get<{ user: User }>("/auth/me");
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SignupRequest) => api.post<{ user: User }>("/auth/signup", input),
    onSuccess: (data) => queryClient.setQueryData(ME_QUERY_KEY, data),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequest) => api.post<{ user: User }>("/auth/login", input),
    onSuccess: (data) => queryClient.setQueryData(ME_QUERY_KEY, data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSuccess: () => queryClient.setQueryData(ME_QUERY_KEY, null),
  });
}
