import type { Car, QuestionnaireInput, RecommendationResult, Review } from "@car-app/shared";
export type CarWithReviews = Car & {
    reviews: Review[];
};
export type PaginatedCarsResponse = {
    items: CarWithReviews[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
export type ListCarsParams = {
    page?: number;
    limit?: number;
    search?: string;
    segment?: string;
    fuelType?: string;
    transmission?: string;
    minPriceLakh?: number;
    maxPriceLakh?: number;
    tags?: string;
};
export type CompareResponse = {
    cars: CarWithReviews[];
    highlights: {
        bestSafetyCarId: number;
        bestValueCarId: number;
        bestEfficiencyCarId: number;
    };
    commonTags: string[];
};
export declare function wakeApi(): Promise<void>;
export declare function listCars(params?: ListCarsParams): Promise<PaginatedCarsResponse>;
export declare function getCarById(id: number): Promise<CarWithReviews>;
export declare function compareCars(ids: number[]): Promise<CompareResponse>;
export declare function getRecommendations(input: QuestionnaireInput): Promise<RecommendationResult>;
