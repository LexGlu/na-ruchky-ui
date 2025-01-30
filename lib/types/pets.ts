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
 * Pet
 */
export const Pet = z.object({
  id: z.string(),
  name: z.string(),
  species: Species,
  sex: Sex,
  breed: z.string().nullable().optional(),
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
