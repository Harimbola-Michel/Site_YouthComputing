export const MESSAGES = {
  // Success
  SUCCESS: {
    CREATED: 'Créé avec succès',
    UPDATED: 'Mis à jour avec succès',
    DELETED: 'Supprimé avec succès',
    LOGIN: 'Connexion réussie',
    LOGOUT: 'Déconnexion réussie',
    REGISTER: 'Inscription réussie',
    VERIFIED: 'Email vérifié avec succès',
    RESET_SENT: 'Email de réinitialisation envoyé',
    RESET_COMPLETE: 'Mot de passe réinitialisé avec succès',
    UPLOADED: 'Fichier uploadé avec succès',
    EXPORTED: 'Exportation réussie',
    SENT: 'Message envoyé avec succès',
    APPROVED: 'Approuvé avec succès',
    REJECTED: 'Rejeté avec succès',
    SUBSCRIBED: 'Abonnement réussi',
    UNSUBSCRIBED: 'Désabonnement réussi',
    PASSWORD_CHANGED: 'Mot de passe changé avec succès',
    PROFILE_UPDATED: 'Profil mis à jour avec succès',
  },

  // Errors
  ERROR: {
    NOT_FOUND: 'Ressource non trouvée',
    UNAUTHORIZED: 'Accès non autorisé',
    FORBIDDEN: 'Accès interdit',
    VALIDATION: 'Erreur de validation',
    INTERNAL: 'Erreur interne du serveur',
    DUPLICATE: 'Cette ressource existe déjà',
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    INVALID_TOKEN: 'Token invalide',
    EXPIRED_TOKEN: 'Token expiré',
    RATE_LIMIT: 'Trop de requêtes, veuillez réessayer plus tard',
    MISSING_FIELD: 'Champ obligatoire manquant',
    INVALID_FORMAT: 'Format invalide',
    ALREADY_EXISTS: 'Cette ressource existe déjà',
    IN_USE: 'Cette ressource est utilisée et ne peut pas être supprimée',
    DEPENDENCY: 'Erreur de dépendance',
    TIMEOUT: 'Temps d\'attente dépassé',
    SERVICE_UNAVAILABLE: 'Service indisponible',
    BAD_REQUEST: 'Requête invalide',
    CONFLICT: 'Conflit',
    UNPROCESSABLE: 'Données non traitables',
    PAYMENT_REQUIRED: 'Paiement requis',
    LOCKED: 'Ressource verrouillée',
    NETWORK: 'Erreur réseau',
    UNKNOWN: 'Une erreur inattendue est survenue',
  },

  // Auth
  AUTH: {
    LOGIN_SUCCESS: 'Connexion réussie !',
    LOGIN_FAILED: 'Email ou mot de passe incorrect',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    REGISTER_SUCCESS: 'Inscription réussie ! Un email de vérification vous a été envoyé.',
    VERIFY_EMAIL: 'Veuillez vérifier votre email',
    EMAIL_VERIFIED: 'Email vérifié avec succès !',
    RESET_SENT: 'Un email de réinitialisation vous a été envoyé',
    RESET_COMPLETE: 'Mot de passe réinitialisé avec succès !',
    TOKEN_REFRESHED: 'Token rafraîchi avec succès',
    ACCOUNT_LOCKED: 'Compte verrouillé, veuillez contacter l\'administrateur',
    ACCOUNT_DISABLED: 'Compte désactivé',
    ACCOUNT_SUSPENDED: 'Compte suspendu',
    ACCOUNT_PENDING: 'Compte en attente de vérification',
    SESSION_EXPIRED: 'Session expirée, veuillez vous reconnecter',
  },

  // Payment
  PAYMENT: {
    SUCCESS: 'Paiement effectué avec succès',
    FAILED: 'Paiement échoué',
    PENDING: 'Paiement en attente',
    REFUNDED: 'Paiement remboursé',
    PARTIAL: 'Paiement partiel',
  },

  // Notification
  NOTIFICATION: {
    SENT: 'Notification envoyée',
    READ: 'Notification marquée comme lue',
    ALL_READ: 'Toutes les notifications ont été marquées comme lues',
    DELETED: 'Notification supprimée',
    NO_NOTIFICATIONS: 'Aucune notification',
  },

  // Formations
  FORMATION: {
    CREATED: 'Formation créée avec succès',
    UPDATED: 'Formation mise à jour avec succès',
    DELETED: 'Formation supprimée avec succès',
    PUBLISHED: 'Formation publiée avec succès',
    UNPUBLISHED: 'Formation dépubliée avec succès',
    REGISTERED: 'Inscription à la formation réussie',
    REGISTRATION_CONFIRMED: 'Inscription confirmée',
    REGISTRATION_CANCELLED: 'Inscription annulée',
    SESSION_CREATED: 'Session créée avec succès',
    SESSION_UPDATED: 'Session mise à jour avec succès',
    SESSION_CANCELLED: 'Session annulée avec succès',
    FULL: 'Cette session est complète',
    ALREADY_REGISTERED: 'Vous êtes déjà inscrit à cette formation',
  },

  // Y2C
  Y2C: {
    MEMBER_CREATED: 'Membre Y2C créé avec succès',
    MEMBER_UPDATED: 'Membre Y2C mis à jour avec succès',
    MEMBER_DELETED: 'Membre Y2C supprimé avec succès',
    MEMBER_APPROVED: 'Membre Y2C approuvé avec succès',
    EVENT_CREATED: 'Événement Y2C créé avec succès',
    EVENT_UPDATED: 'Événement Y2C mis à jour avec succès',
    EVENT_DELETED: 'Événement Y2C supprimé avec succès',
    EVENT_REGISTERED: 'Inscription à l\'événement réussie',
    BADGE_GENERATED: 'Badge généré avec succès',
  },

  // Article
  ARTICLE: {
    CREATED: 'Article créé avec succès',
    UPDATED: 'Article mis à jour avec succès',
    DELETED: 'Article supprimé avec succès',
    PUBLISHED: 'Article publié avec succès',
    UNPUBLISHED: 'Article dépublié avec succès',
    COMMENT_ADDED: 'Commentaire ajouté avec succès',
    COMMENT_APPROVED: 'Commentaire approuvé avec succès',
    COMMENT_DELETED: 'Commentaire supprimé avec succès',
  },

  // Project
  PROJECT: {
    CREATED: 'Projet créé avec succès',
    UPDATED: 'Projet mis à jour avec succès',
    DELETED: 'Projet supprimé avec succès',
    METRIC_ADDED: 'Métrique ajoutée avec succès',
    METRIC_UPDATED: 'Métrique mise à jour avec succès',
    METRIC_DELETED: 'Métrique supprimée avec succès',
  },
};

export type MessageKey = keyof typeof MESSAGES;