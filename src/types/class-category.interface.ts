import { IPagination } from "./general.interface";

// TypeScript Interface
export interface IClassCategoryData {
  id: number;
  className: string;
  description: string;
  creditEligible: boolean;
  defaultCredits: number | null;
  status: "Active" | "Inactive";
}

export interface IClassCategoryResponse {
  data: IClassCategoryData[];
  pagination: IPagination;
}

// JSON Data
export const classesResponse: IClassCategoryResponse = {
  data: [
    {
      id: 1,
      className: "Yoga",
      description: "You can inster the descrip...",
      creditEligible: true,
      defaultCredits: 1,
      status: "Active",
    },
    {
      id: 2,
      className: "Ballet",
      description: "You can inster the descrip...",
      creditEligible: true,
      defaultCredits: 1,
      status: "Active",
    },
    {
      id: 3,
      className: "Pillates",
      description: "You can inster the descrip...",
      creditEligible: true,
      defaultCredits: 2,
      status: "Active",
    },
    {
      id: 4,
      className: "Prenatal Yoga",
      description: "You can inster the descrip...",
      creditEligible: true,
      defaultCredits: 1,
      status: "Active",
    },
    {
      id: 5,
      className: "Other Class",
      description: "You can inster the descrip...",
      creditEligible: false,
      defaultCredits: null,
      status: "Active",
    },
    {
      id: 6,
      className: "Other Class",
      description: "You can inster the descrip...",
      creditEligible: true,
      defaultCredits: 1,
      status: "Inactive",
    },
  ],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 6,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    previousPage: null,
    showTotal: true,
  },
};
