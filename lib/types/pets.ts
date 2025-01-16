import { z } from "zod";

export const Species = z.enum(["dog", "cat"]);
export const Sex = z.enum(["f", "m"]);

export const Pet = z.object({
  id: z.string(),
  name: z.string(),
  species: Species,
  sex: Sex,
  breed: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  is_vaccinated: z.boolean(),
  description: z.string().nullable().optional(),
  health: z.string().nullable().optional(),
  profile_picture: z.string().nullable().optional(),
  owner: z.any(),
});

export const ListingStatus = z.enum(["active", "sold", "adopted", "expired", "archived"]);

export const PetListing = z.object({
  id: z.string(),
  pet: Pet,
  title: z.string(),
  status: ListingStatus,
  price: z.string().nullable().optional(),
  views_count: z.number(),
});

export const PetListingArrayResponse = z.object({
  items: z.array(PetListing),
  count: z.number(),
});

export type Species = z.infer<typeof Species>;
export type Pet = z.infer<typeof Pet>;
export type ListingStatus = z.infer<typeof ListingStatus>;
export type PetListing = z.infer<typeof PetListing>;
export type PetListingArrayResponse = z.infer<typeof PetListingArrayResponse>;