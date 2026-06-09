import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginRequest, SignupRequest, User } from "@motorcover/shared-types";
import { api, sessionToken } from "./api";

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
    mutationFn: (input: SignupRequest) => api.post<{ token: string; user: User }>("/auth/signup", input),
    onSuccess: (data) => {
      sessionToken.set(data.token);
      queryClient.setQueryData(ME_QUERY_KEY, { user: data.user });
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequest) => api.post<{ token: string; user: User }>("/auth/login", input),
    onSuccess: (data) => {
      sessionToken.set(data.token);
      queryClient.setQueryData(ME_QUERY_KEY, { user: data.user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSuccess: () => {
      sessionToken.clear();
      queryClient.setQueryData(ME_QUERY_KEY, null);
    },
  });
}
