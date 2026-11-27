// Normalisation unique du téléphone (création de commande ET suivi).
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-.()]/g, '').replace(/^(\+|00)225/, '')
}
