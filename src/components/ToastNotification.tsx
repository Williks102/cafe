// components/ToastNotification.tsx
"use client";

import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import Link from 'next/link';

interface ToastProps {
  id: string;
  type: 'order' | 'product' | 'promotion' | 'system';
  title: string;
  message: string;
  icon?: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  onClose: () => void;
}

function Toast({ id, type, title, message, icon, priority, actionUrl, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);

    // Auto-fermeture selon la priorité
    const autoCloseDelay = priority === 'high' ? 7000 : priority === 'medium' ? 5000 : 3000;
    
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [priority]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Couleurs selon le type
  const getTypeStyles = () => {
    switch (type) {
      case 'order':
        return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'product':
        return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'promotion':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'system':
        return 'bg-gray-50 border-gray-300 text-gray-800';
      default:
        return 'bg-white border-gray-300 text-gray-800';
    }
  };

  // Classes d'animation
  const animationClasses = isLeaving 
    ? 'transform translate-x-full opacity-0'
    : isVisible 
    ? 'transform translate-x-0 opacity-100'
    : 'transform translate-x-full opacity-0';

  return (
    <div
      className={`
        max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 pointer-events-auto
        transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${animationClasses}
      `}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icône */}
          <div className="flex-shrink-0 mr-3">
            {icon ? (
              <span className="text-xl">{icon}</span>
            ) : (
              <Bell className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {message}
            </p>
            
            {/* Action */}
            {actionUrl && (
              <div className="mt-3">
                <Link
                  href={actionUrl}
                  onClick={handleClose}
                  className="text-xs font-medium text-amber-600 hover:text-amber-700"
                >
                  Voir →
                </Link>
              </div>
            )}
          </div>

          {/* Bouton fermer */}
          <button
            onClick={handleClose}
            className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { notifications } = useNotifications();
  const [toastNotifications, setToastNotifications] = useState<string[]>([]);

  // Afficher les nouvelles notifications en toast
  useEffect(() => {
    const newNotifications = notifications
      .filter(notif => !notif.read && notif.priority === 'high')
      .slice(0, 3) // Max 3 toasts
      .map(notif => notif.id);

    // Ajouter seulement les nouvelles
    const toAdd = newNotifications.filter(id => !toastNotifications.includes(id));
    if (toAdd.length > 0) {
      setToastNotifications(prev => [...prev, ...toAdd]);
    }
  }, [notifications]);

  const removeToast = (id: string) => {
    setToastNotifications(prev => prev.filter(toastId => toastId !== id));
  };

  // Filtrer les notifications à afficher en toast
  const toastsToShow = notifications.filter(notif => 
    toastNotifications.includes(notif.id)
  );

  if (toastsToShow.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toastsToShow.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          icon={notification.icon}
          priority={notification.priority}
          actionUrl={notification.actionUrl}
          onClose={() => removeToast(notification.id)}
        />
      ))}
    </div>
  );
}