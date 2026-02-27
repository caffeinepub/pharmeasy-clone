import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
    addresses: Array<Address>;
    phone: string;
}
export type Time = bigint;
export interface Article {
    id: ArticleId;
    title: string;
    content: string;
    date: Time;
    author: string;
    imageUrl: string;
    excerpt: string;
}
export interface Address {
    zip: string;
    street: string;
    country: string;
    city: string;
    state: string;
}
export interface OrderItem {
    quantity: bigint;
    product: Product;
}
export type HealthPackageId = string;
export interface LabTest {
    id: LabTestId;
    turnaroundTime: string;
    name: string;
    description: string;
    sampleType: string;
    imageUrl: string;
    marketPrice: bigint;
    discountedPrice: bigint;
    testParameters: Array<string>;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    deliveryAddress: Address;
    userId: UserId;
    createdAt: Time;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export type ArticleId = string;
export interface LabTestBooking {
    id: string;
    userId: UserId;
    createdAt: Time;
    appointmentTime: Time;
    labTestId: LabTestId;
}
export type UserId = string;
export type LabTestId = string;
export type ProductId = string;
export interface Prescription {
    id: string;
    status: PrescriptionStatus;
    userId: UserId;
    orderId: OrderId;
    image: ExternalBlob;
    uploadedAt: Time;
}
export interface HealthPackage {
    id: HealthPackageId;
    turnaroundTime: string;
    name: string;
    description: string;
    isPopular: boolean;
    sampleType: string;
    imageUrl: string;
    includedTests: Array<string>;
    marketPrice: bigint;
    discountedPrice: bigint;
    testParameters: Array<string>;
}
export interface Product {
    id: ProductId;
    manufacturer: string;
    name: string;
    ratings: Array<bigint>;
    description: string;
    stockCount: bigint;
    imageUrl: string;
    category: string;
    requiresPrescription: boolean;
    price: bigint;
    discountedPrice?: bigint;
}
export type OrderId = string;
export enum OrderStatus {
    shipped = "shipped",
    placed = "placed",
    delivered = "delivered",
    processing = "processing"
}
export enum PrescriptionStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addHealthPackage(healthPackage: HealthPackage): Promise<HealthPackageId>;
    addLabTest(labTest: LabTest): Promise<LabTestId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookLabTest(labTestId: LabTestId, appointmentTime: Time): Promise<string>;
    createOrder(items: Array<OrderItem>, totalAmount: bigint, deliveryAddress: Address, requiresPrescription: boolean): Promise<OrderId>;
    deleteHealthPackage(healthPackageId: HealthPackageId): Promise<void>;
    deleteLabTest(labTestId: LabTestId): Promise<void>;
    getAllArticles(): Promise<Array<Article>>;
    getAllBookings(): Promise<Array<LabTestBooking>>;
    getAllCategories(): Promise<Array<string>>;
    getAllLabTests(): Promise<Array<LabTest>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllPrescriptions(): Promise<Array<Prescription>>;
    getArticleById(articleId: ArticleId): Promise<Article | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getHealthPackage(healthPackageId: HealthPackageId): Promise<HealthPackage | null>;
    getHealthPackages(): Promise<Array<HealthPackage>>;
    getLabTestById(labTestId: LabTestId): Promise<LabTest | null>;
    getMyLabTestBookings(): Promise<Array<LabTestBooking>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyPrescriptions(): Promise<Array<Prescription>>;
    getOrdersByUser(userId: UserId): Promise<Array<Order>>;
    getPopularHealthPackages(): Promise<Array<HealthPackage>>;
    getProductById(productId: ProductId): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchHealthPackages(searchTerm: string, priceRange: [bigint, bigint] | null): Promise<Array<HealthPackage>>;
    searchProducts(searchTerm: string, category: string | null, minPrice: bigint | null, maxPrice: bigint | null, brand: string | null, requiresPrescription: boolean | null, sortBy: string | null): Promise<Array<Product>>;
    seedData(): Promise<void>;
    updateHealthPackage(healthPackageId: HealthPackageId, updatedPackage: HealthPackage): Promise<void>;
    updateLabTest(labTestId: LabTestId, updatedLabTest: LabTest): Promise<void>;
    updateOrderStatus(orderId: OrderId, status: OrderStatus): Promise<void>;
    updatePrescriptionStatus(prescriptionId: string, status: PrescriptionStatus): Promise<void>;
    uploadImage(image: ExternalBlob): Promise<ExternalBlob>;
    uploadPrescription(orderId: OrderId, prescriptionImage: ExternalBlob): Promise<string>;
}
