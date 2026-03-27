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
export interface SearchFilters {
    propertyType?: PropertyType;
    minRent?: bigint;
    city?: string;
    keyword?: string;
    maxRent?: bigint;
}
export interface PropertyListingInput {
    title: string;
    ownerName: string;
    propertyType: PropertyType;
    area: string;
    city: string;
    description: string;
    amenities: Array<string>;
    address: string;
    rentPerMonth: bigint;
    contactPhone: string;
    images: Array<ExternalBlob>;
}
export interface PropertyListing {
    id: string;
    status: PropertyStatus;
    title: string;
    ownerName: string;
    propertyType: PropertyType;
    ownerId: Principal;
    area: string;
    city: string;
    createdAt: bigint;
    description: string;
    amenities: Array<string>;
    viewCount: bigint;
    isFeatured: boolean;
    address: string;
    rentPerMonth: bigint;
    contactPhone: string;
    images: Array<ExternalBlob>;
}
export interface UserProfile {
    name: string;
    role: string;
    phone?: string;
}
export enum PropertyStatus {
    rented = "rented",
    available = "available"
}
export enum PropertyType {
    pg = "pg",
    studio = "studio",
    bhk1 = "bhk1",
    bhk2 = "bhk2",
    bachelorRoom = "bachelorRoom",
    hostel = "hostel"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToFavorites(listingId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPropertyListing(input: PropertyListingInput): Promise<string>;
    deletePropertyListing(id: string): Promise<void>;
    getAllListings(): Promise<Array<PropertyListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: string): Promise<PropertyListing>;
    getListingCountByCity(): Promise<Array<[string, bigint]>>;
    getListingsByOwner(ownerId: Principal): Promise<Array<PropertyListing>>;
    getMostViewedListings(limit: bigint): Promise<Array<PropertyListing>>;
    getPropertyListing(id: string): Promise<PropertyListing>;
    getPropertyTypes(): Promise<Array<string>>;
    getUserFavorites(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markListingAvailable(id: string): Promise<void>;
    markListingRented(id: string): Promise<void>;
    removeFromFavorites(listingId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPropertyListings(filters: SearchFilters): Promise<Array<PropertyListing>>;
    updatePropertyListing(id: string, input: PropertyListingInput): Promise<void>;
}
