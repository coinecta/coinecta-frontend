import { z } from 'zod';

const ZHeroCarousel = z.object({
  id: z.number().optional(),
  title: z.string(),
  subtitle: z.string(),
  image: z.string().nullable(),
  buttonTitle: z.string(),
  buttonLink: z.string(),
  order: z.number().optional()
});

export { ZHeroCarousel };

