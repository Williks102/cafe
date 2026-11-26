// Prix faisant foi côté serveur pour les commandes des landing pages.
// Le client n'envoie que le nom du produit : le prix est ignoré.
export const LANDING_CATALOG: Record<
  string,
  { price: number; category: string; image: string; description: string }
> = {
  'Espresso en Grains Robusta - 250g': { price: 5000, category: 'Grains', image: '', description: '' },
  'Espresso en Grains Robusta - 500g': { price: 9500, category: 'Grains', image: '', description: '' },
  'Espresso en Grains Robusta - 1kg': { price: 18000, category: 'Grains', image: '', description: '' },
  'Espresso Moulu Robusta - 200g': { price: 2502, category: 'Moulu', image: '', description: '' },
  'Espresso Moulu Robusta - 500g': { price: 3529, category: 'Moulu', image: '', description: '' },
  'Espresso Moulu Robusta - 1kg': { price: 6182, category: 'Moulu', image: '', description: '' },
}
