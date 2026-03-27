import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  PropertyListing,
  PropertyListingInput,
  SearchFilters,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing[]>({
    queryKey: ["allListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing>({
    queryKey: ["listing", id],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPropertyListing(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useSearchListings(filters: SearchFilters, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing[]>({
    queryKey: ["searchListings", filters],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchPropertyListings(filters);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useGetListingsByOwner(ownerId: string | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing[]>({
    queryKey: ["ownerListings", ownerId],
    queryFn: async () => {
      if (!actor || !ownerId) return [];
      const { Principal } = await import("@dfinity/principal");
      return actor.getListingsByOwner(Principal.fromText(ownerId));
    },
    enabled: !!actor && !isFetching && !!ownerId,
  });
}

export function useGetMostViewedListings(limit: number) {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing[]>({
    queryKey: ["mostViewedListings", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMostViewedListings(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserFavorites() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["userFavorites"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserFavorites();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PropertyListingInput) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPropertyListing(input as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
      queryClient.invalidateQueries({ queryKey: ["ownerListings"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: string; input: PropertyListingInput }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updatePropertyListing(id, input as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
      queryClient.invalidateQueries({ queryKey: ["ownerListings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePropertyListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
      queryClient.invalidateQueries({ queryKey: ["ownerListings"] });
    },
  });
}

export function useMarkListingRented() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markListingRented(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
      queryClient.invalidateQueries({ queryKey: ["ownerListings"] });
    },
  });
}

export function useMarkListingAvailable() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.markListingAvailable(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allListings"] });
      queryClient.invalidateQueries({ queryKey: ["ownerListings"] });
    },
  });
}

export function useToggleFavorite() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isFav }: { id: string; isFav: boolean }) => {
      if (!actor) throw new Error("Actor not available");
      if (isFav) return actor.removeFromFavorites(id);
      return actor.addToFavorites(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userFavorites"] });
    },
  });
}
