/**
 * Types de permissions disponibles pour l'accès aux maisons
 */
export enum PermissionType {
  /** Propriétaire - Contrôle total (créer, lire, modifier, supprimer, gérer les utilisateurs) */
  OWNER = 'owner',

  /** Lecture seule - Peut uniquement consulter */
  READ = 'read',

  /** Lecture et écriture - Peut consulter et modifier */
  READ_WRITE = 'read-write',
}

/**
 * Liste des types de permissions valides
 */
export const VALID_PERMISSION_TYPES = Object.values(PermissionType);
