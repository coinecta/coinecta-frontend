import { z } from 'zod';
import { ZHeroCarousel } from "./zod-schemas/heroSchema";

declare global {
  type THeroCarousel = z.infer<typeof ZHeroCarousel>;
  type THeroCarouselWithIds = {
    title: string;
    subtitle: string;
    image: string | null;
    buttonTitle: string;
    buttonLink: string;
    id: number;
    order: number;
  };
}