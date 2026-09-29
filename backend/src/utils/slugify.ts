import slugify from 'slugify';
import { prisma } from '../config/prisma';

export { slugify };

export const slugifyText = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
};

/**
 * Génère un slug unique pour un modèle Prisma.
 * @param baseSlug - Titre à transformer
 * @param modelName - Nom du modèle en minuscule (ex: 'project', 'article')
 * @param field - Champ unique (par défaut 'slug')
 * @returns Slug unique
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  modelName: string,
  field: string = 'slug'
): Promise<string> => {
  const slug = slugifyText(baseSlug) || modelName;
  let uniqueSlug = slug;
  let counter = 1;

  const modelDelegate = (prisma as any)[modelName];
  if (!modelDelegate) {
    throw new Error(`Modèle "${modelName}" introuvable dans Prisma`);
  }

  while (true) {
    const existing = await modelDelegate.findUnique({
      where: { [field]: uniqueSlug },
      select: { id: true },
    });
    if (!existing) break;
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
};