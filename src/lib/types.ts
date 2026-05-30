export type RepositoryStatus = "IMPORTED" | "LOADING" | "ERROR" | "NOT_STARTED";

export type Repository = {
    id: string;
    name: string;
    url: string;
    status: RepositoryStatus;
    error: string | null;
    createdAt?: Date;
    updatedAt?: Date;
};