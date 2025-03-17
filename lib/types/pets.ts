import { z } from "zod";

/**
 * Species
 */
export const Species = z.enum(["dog", "cat"]);
export type Species = z.infer<typeof Species>;

/**
 * Sex
 */
export const Sex = z.enum(["f", "m"]);
export type Sex = z.infer<typeof Sex>;

/**
 * SocialPlatform
 */
export const SocialPlatform = z.enum(["instagram", "tiktok", "youtube"]);
export type SocialPlatform = z.infer<typeof SocialPlatform>;

/**
 * PetSocialLink
 */
export const PetSocialLink = z.object({
  platform: SocialPlatform,
  url: z.string(),
});
export type PetSocialLink = z.infer<typeof PetSocialLink>;

/**
 * PetImage
 */
export const PetImage = z.object({
  id: z.string(),
  image: z.string(),
  order: z.number(),
  caption: z.string().nullable(),
  created_at: z.string(),
});
export type PetImage = z.infer<typeof PetImage>;

/**
 * Pet
 */
export const Pet = z.object({
  id: z.string(),
  name: z.string(),
  species: Species,
  sex: Sex,
  breed_name: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  is_vaccinated: z.boolean(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  health: z.string().nullable().optional(),
  profile_picture: z.string().nullable().optional(),
  owner: z.any(),
  tags: z.array(z.string()).optional(),
  social_links: z.array(PetSocialLink).optional(),
  images: z.array(PetImage).optional(),
});
export type Pet = z.infer<typeof Pet>;

/**
 * ListingStatus
 */
export const ListingStatus = z.enum([
  "active",
  "sold",
  "adopted",
  "expired",
  "archived",
]);
export type ListingStatus = z.infer<typeof ListingStatus>;

/**
 * PetListing
 */
export const PetListing = z.object({
  id: z.string(),
  pet: Pet,
  title: z.string(),
  status: ListingStatus,
  price: z.string().nullable().optional(),
  views_count: z.number(),
});
export type PetListing = z.infer<typeof PetListing>;

/**
 * PetListingArrayResponse
 */
export const PetListingArrayResponse = z.object({
  items: z.array(PetListing),
  count: z.number(),
});
export type PetListingArrayResponse = z.infer<typeof PetListingArrayResponse>;

export interface FilterOption {
  label: string;
  options: Array<{
    label: string;
    value: string;
    maxAgeValue?: string;
    minAgeValue?: string;
  }>;
  param: string;
  secondaryParam?: string;
}

export const filterOptions: FilterOption[] = [
  {
    label: "Стаж",
    options: [
      { label: "0-1 рік", value: "0-1", minAgeValue: "", maxAgeValue: "1" },
      { label: "1-3 роки", value: "1-3", minAgeValue: "1", maxAgeValue: "3" },
      { label: "3+ років", value: "3+", minAgeValue: "3", maxAgeValue: "" },
    ],
    param: "min_age",
    secondaryParam: "max_age",
  },
  {
    label: "Стать",
    options: [
      { label: "Дівчинка", value: "f" },
      { label: "Хлопчик", value: "m" },
    ],
    param: "sex",
  },
  {
    label: "Офіс",
    options: [
      { label: "Київ", value: "київ" },
      { label: "Львів", value: "львів" },
      { label: "Одеса", value: "одеса" },
      { label: "Харків", value: "харків" },
    ],
    param: "location",
  },
];

export type PetType = "all" | "cats" | "dogs";
