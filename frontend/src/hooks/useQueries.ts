import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Product, Article, LabTest, HealthPackage, HealthPackageId,
  UserProfile, Address, OrderItem, OrderStatus, Order,
  LabTestBooking, Prescription, PrescriptionStatus, LabTestId
} from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSearchProducts(
  searchTerm: string,
  category: string | null,
  minPrice: bigint | null,
  maxPrice: bigint | null,
  brand: string | null,
  requiresPrescription: boolean | null,
  sortBy: string | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'search', searchTerm, category, minPrice?.toString(), maxPrice?.toString(), brand, requiresPrescription, sortBy],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchProducts(searchTerm, category, minPrice, maxPrice, brand, requiresPrescription, sortBy);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProductById(productId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor || !productId) return null;
      return actor.getProductById(productId);
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useGetProductsByCategory(category: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      if (!actor || !category) return [];
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useGetAllCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllArticles() {
  const { actor, isFetching } = useActor();

  return useQuery<Article[]>({
    queryKey: ['articles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArticles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetArticleById(articleId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Article | null>({
    queryKey: ['article', articleId],
    queryFn: async () => {
      if (!actor || !articleId) return null;
      return actor.getArticleById(articleId);
    },
    enabled: !!actor && !isFetching && !!articleId,
  });
}

export function useGetAllLabTests() {
  const { actor, isFetching } = useActor();

  return useQuery<LabTest[]>({
    queryKey: ['labTests'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLabTests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLabTestById(labTestId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<LabTest | null>({
    queryKey: ['labTest', labTestId],
    queryFn: async () => {
      if (!actor || !labTestId) return null;
      return actor.getLabTestById(labTestId);
    },
    enabled: !!actor && !isFetching && !!labTestId,
  });
}

export function useHealthPackages() {
  const { actor, isFetching } = useActor();

  return useQuery<HealthPackage[]>({
    queryKey: ['healthPackages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHealthPackages();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHealthPackage(id: HealthPackageId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<HealthPackage | null>({
    queryKey: ['healthPackage', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getHealthPackage(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetMyLabTestBookings() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myLabTestBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyLabTestBookings();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items,
      totalAmount,
      deliveryAddress,
      requiresPrescription,
    }: {
      items: OrderItem[];
      totalAmount: bigint;
      deliveryAddress: Address;
      requiresPrescription: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrder(items, totalAmount, deliveryAddress, requiresPrescription);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useBookLabTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labTestId, appointmentTime }: { labTestId: string; appointmentTime: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bookLabTest(labTestId, appointmentTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLabTestBookings'] });
    },
  });
}

export function useUploadPrescription() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, file }: { orderId: string; file: File }) => {
      if (!actor) throw new Error('Actor not available');
      const { ExternalBlob } = await import('../backend');
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(bytes);
      return actor.uploadPrescription(orderId, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPrescriptions'] });
    },
  });
}

export function useSeedData() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.seedData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

// ---- Admin Hooks ----

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useAddLabTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labTest: LabTest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLabTest(labTest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] });
    },
  });
}

export function useUpdateLabTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labTestId, updatedLabTest }: { labTestId: LabTestId; updatedLabTest: LabTest }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLabTest(labTestId, updatedLabTest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] });
    },
  });
}

export function useDeleteLabTest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labTestId: LabTestId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteLabTest(labTestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labTests'] });
    },
  });
}

export function useAddHealthPackage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (healthPackage: HealthPackage) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHealthPackage(healthPackage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthPackages'] });
    },
  });
}

export function useUpdateHealthPackage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ healthPackageId, updatedPackage }: { healthPackageId: HealthPackageId; updatedPackage: HealthPackage }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHealthPackage(healthPackageId, updatedPackage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthPackages'] });
    },
  });
}

export function useDeleteHealthPackage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (healthPackageId: HealthPackageId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteHealthPackage(healthPackageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthPackages'] });
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<LabTestBooking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useGetAllPrescriptions() {
  const { actor, isFetching } = useActor();

  return useQuery<Prescription[]>({
    queryKey: ['allPrescriptions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPrescriptions();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useUpdatePrescriptionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ prescriptionId, status }: { prescriptionId: string; status: PrescriptionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePrescriptionStatus(prescriptionId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPrescriptions'] });
    },
  });
}

export function useUploadImage() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) => {
      if (!actor) throw new Error('Actor not available');
      const { ExternalBlob } = await import('../backend');
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let blob = ExternalBlob.fromBytes(bytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      return actor.uploadImage(blob);
    },
  });
}
