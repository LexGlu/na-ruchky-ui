import { z } from "zod";
import { Species } from "@/lib/types/pets";

/**
 * Breed
 */
export const Breed = z.object({
  id: z.string(),
  name: z.string(),
  species: Species,
  description: z.string().nullable().optional(),
  origin: z.string().nullable().optional(),
  life_span: z.string().nullable().optional(),
  weight: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  image_hover_url: z.string().nullable().optional(),
});

export type Breed = z.infer<typeof Breed>;

/**
 * BreedArrayResponse
 */
export const BreedArrayResponse = z.object({
  items: z.array(Breed),
  count: z.number(),
});

export type BreedArrayResponse = z.infer<typeof BreedArrayResponse>;
