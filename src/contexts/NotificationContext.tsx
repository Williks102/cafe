// contexts/NotificationContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface Notification {
  id: string;
  type: 'order' | 'product' | 'promotion' | 'system';
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Générer un ID unique
  const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Ajouter une notification
  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      createdAt: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Limiter à 50 notifications max
    setNotifications(prev => prev.slice(0, 50));
  };

  // Marquer comme lu
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Marquer tout comme lu
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  // Supprimer une notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Vider toutes les notifications
  const clearAll = () => {
    setNotifications([]);
  };

  // Calculer le nombre de non-lues
  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Charger les notifications initiales (simulé pour l'instant)
  useEffect(() => {
    if (session) {
      // Notification de bienvenue
      addNotification({
        type: 'system',
        title: 'Bienvenue !',
        message: `Bonjour ${session.user.name?.split(' ')[0]}, bienvenue sur Moses Café !`,
        priority: 'medium',
        icon: '👋'
      });
    }
  }, [session]);

  // Simuler des notifications d'exemple (à supprimer plus tard)
  useEffect(() => {
    if (session && notifications.length === 1) {
      setTimeout(() => {
        addNotification({
          type: 'product',
          title: 'Nouveau café disponible',
          message: 'Découvrez notre nouveau Espresso Ethiopian Premium !',
          priority: 'medium',
          icon: '☕',
          actionUrl: '/menu'
        });
      }, 3000);

      setTimeout(() => {
        addNotification({
          type: 'promotion',
          title: 'Promotion spéciale',
          message: 'Réduction de 15% sur tous les cafés en grains !',
          priority: 'high',
          icon: '🎉',
          actionUrl: '/menu'
        });
      }, 6000);
    }
  }, [session, notifications.length]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook pour utiliser le context
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helpers pour créer des notifications spécifiques
export const createOrderNotification = (orderId: number, status: string): Omit<Notification, 'id' | 'createdAt' | 'read'> => {
  const statusMessages = {
    CONFIRMED: { message: 'Votre commande a été confirmée', icon: '✅' },
    PREPARING: { message: 'Votre commande est en préparation', icon: '👨‍🍳' },
    READY: { message: 'Votre commande est prête !', icon: '📦' },
    DELIVERED: { message: 'Votre commande a été livrée', icon: '🚚' },
    CANCELLED: { message: 'Votre commande a été annulée', icon: '❌' },
  };

  const statusInfo = statusMessages[status as keyof typeof statusMessages] || 
    { message: 'Statut de commande mis à jour', icon: '📋' };

  return {
    type: 'order',
    title: `Commande #${orderId}`,
    message: statusInfo.message,
    priority: status === 'READY' ? 'high' : 'medium',
    icon: statusInfo.icon,
    actionUrl: '/orders'
  };
};

export const createProductNotification = (productName: string): Omit<Notification, 'id' | 'createdAt' | 'read'> => ({
  type: 'product',
  title: 'Nouveau produit',
  message: `${productName} est maintenant disponible !`,
  priority: 'medium',
  icon: '☕',
  actionUrl: '/menu'
});

export const createPromotionNotification = (title: string, message: string): Omit<Notification, 'id' | 'createdAt' | 'read'> => ({
  type: 'promotion',
  title,
  message,
  priority: 'high',
  icon: '🎉',
  actionUrl: '/menu'
});