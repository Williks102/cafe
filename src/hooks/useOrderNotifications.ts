
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/NotificationContext';

interface Order {
  id: number;
  status: string;
  totalPrice: number;
  createdAt: string;
}

export function useOrderNotifications() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();

  // Fonction pour surveiller les changements de statut
  const pollOrderUpdates = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/orders/me');
      if (!response.ok) return;

      const data = await response.json();
      const orders: Order[] = data.orders || [];

      // Vérifier les ordres récents (dernières 24h)
      const recentOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return orderDate > dayAgo;
      });

      // Vérifier le localStorage pour les notifications déjà envoyées
      const sentNotifications = JSON.parse(
        localStorage.getItem('sentOrderNotifications') || '[]'
      );

      recentOrders.forEach(order => {
        const notificationKey = `${order.id}_${order.status}`;
        
        // Si notification pas encore envoyée pour ce statut
        if (!sentNotifications.includes(notificationKey)) {
          // Créer la notification
          addNotification(createOrderStatusNotification(order));
          
          // Marquer comme envoyée
          sentNotifications.push(notificationKey);
          localStorage.setItem('sentOrderNotifications', JSON.stringify(sentNotifications));
        }
      });

    } catch (error) {
      console.error('Erreur lors de la vérification des commandes:', error);
    }
  };

  // Polling toutes les 30 secondes
  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(pollOrderUpdates, 30000);
    
    // Vérification initiale
    pollOrderUpdates();

    return () => clearInterval(interval);
  }, [session, addNotification]);

  return { pollOrderUpdates };
}

// Helper pour créer les notifications de commande
function createOrderStatusNotification(order: Order) {
  const statusConfig = {
    CONFIRMED: {
      title: `Commande #${order.id} confirmée`,
      message: 'Votre commande a été confirmée et sera bientôt préparée.',
      icon: '✅',
      priority: 'medium' as const
    },
    PREPARING: {
      title: `Commande #${order.id} en préparation`,
      message: 'Nos baristas préparent votre commande avec soin.',
      icon: '👨‍🍳',
      priority: 'medium' as const
    },
    READY: {
      title: `Commande #${order.id} prête !`,
      message: 'Votre commande est prête pour le retrait ou la livraison.',
      icon: '📦',
      priority: 'high' as const
    },
    DELIVERED: {
      title: `Commande #${order.id} livrée`,
      message: 'Votre commande a été livrée. Bon appétit !',
      icon: '🚚',
      priority: 'medium' as const
    },
    CANCELLED: {
      title: `Commande #${order.id} annulée`,
      message: 'Votre commande a été annulée. Contactez-nous si nécessaire.',
      icon: '❌',
      priority: 'high' as const
    }
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || {
    title: `Commande #${order.id}`,
    message: 'Statut de votre commande mis à jour.',
    icon: '📋',
    priority: 'medium' as const
  };

  return {
    type: 'order' as const,
    title: config.title,
    message: config.message,
    icon: config.icon,
    priority: config.priority,
    actionUrl: '/orders'
  };
}