// src/lib/notification-utils.tsx
import toast from 'react-hot-toast';

export interface NotificationToastOptions {
  title: string;
  message: string;
  link?: string;
  icon?: string;
}

/**
 * Affiche un toast de notification personnalisé (professionnel)
 */
export function showNotificationToast(notification: NotificationToastOptions) {
  const { title, message, link, icon = '🔔' } = notification;

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                <span className="text-secondary text-lg">{icon}</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {message}
              </p>
              {link && (
                <a
                  href={link}
                  className="mt-2 inline-block text-sm font-medium text-secondary hover:text-secondary/80 transition-colors"
                  onClick={() => toast.dismiss(t.id)}
                >
                  Voir →
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration: 5000, position: 'bottom-right' }
  );

  // Son de notification (optionnel)
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play();
  } catch (_) {
    // Ignorer si le son n'existe pas
  }
}

/**
 * Joue un son de notification (utile pour les mises à jour silencieuses)
 */
export function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play();
  } catch (_) {
    // Ignorer
  }
}