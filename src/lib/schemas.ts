import { z } from 'zod'
import { normalizePhone } from './phone'

// "" -> undefined pour les champs optionnels envoyés vides par les formulaires
const emptyToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().trim().max(max).optional())

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Format d\'email invalide'))

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Nom requis').max(100),
  email: emailSchema,
  // 72 = limite de bcrypt (au-delà, le mot de passe est tronqué silencieusement)
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(72),
})

const productShape = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1).max(5000),
  image: z.string().trim().min(1).max(500),
  price: z.number().int().positive(),
  category: z.string().trim().max(100).nullish(),
  available: z.boolean(),
})

export const productCreateSchema = productShape.extend({ available: z.boolean().default(true) })
// Pas de default à la mise à jour : un champ absent ne doit rien modifier
export const productUpdateSchema = productShape.partial()

export const orderItemSchema = z.object({
  productId: z.number().int().positive().nullish(),
  productName: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  image: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  quantity: z.number().int().min(1).max(100),
}) // price éventuel du client volontairement ignoré (strip par défaut)

export const orderCreateSchema = z.object({
  customerName: optionalText(255),
  customerEmail: z.preprocess(emptyToUndefined, emailSchema.optional()),
  customerPhone: optionalText(30),
  customerAddress: optionalText(300),
  items: z.array(orderItemSchema).min(1, 'Au moins un article doit être commandé').max(50),
  notes: optionalText(1000),
  source: z.string().max(50).default('web_app'),
  notificationPreference: z.enum(['email', 'sms', 'both', 'none']).default('email'),
})

// Suivi invité : numéro de commande ET téléphone (10 chiffres, après normalisation)
export const trackSchema = z.object({
  orderId: z
    .union([z.number(), z.string()], { error: 'Numéro de commande requis' })
    .transform((v) => Number(String(v).replace(/[^0-9]/g, '')))
    .pipe(z.number({ error: 'Numéro de commande invalide' }).int().positive().max(2_147_483_647)),
  phone: z
    .string()
    .transform(normalizePhone)
    .pipe(z.string().regex(/^[0-9]{10}$/, 'Numéro de téléphone invalide (10 chiffres)')),
})

export function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Données invalides'
}
