// src/routes/setting.routes.ts
import { Router } from 'express';
import { SettingController } from '../controllers/setting.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/role.middleware';

const router = Router();
const settingController = new SettingController();

/* ============================================================
 *  🌐 ROUTES PUBLIQUES (aucune auth requise)
 *  ⚠️ DOIVENT être déclarées AVANT le router.use(authMiddleware)
 * ============================================================ */

/**
 * GET /api/settings/public
 * Renvoie les groupes publics fusionnés avec les défauts :
 * { general, public, navbar, footer }
 * Utilisé par la Navbar et le Footer côté client.
 */
router.get('/public', settingController.getPublic);

/* ============================================================
 *  🔒 ROUTES ADMIN (auth + rôle admin requis)
 *  Tout ce qui est déclaré APRÈS ce router.use est protégé.
 * ============================================================ */
router.use(authMiddleware, isAdmin);

/**
 * GET /api/settings
 * Renvoie TOUS les groupes (admin) :
 * { general, security, email, backup, public, navbar, footer }
 */
router.get('/', settingController.getAll);

/**
 * GET /api/settings/group/:group
 * Renvoie un groupe spécifique.
 * Ex: GET /api/settings/group/navbar
 *     GET /api/settings/group/footer
 *     GET /api/settings/group/general
 */
router.get('/group/:group', settingController.getGroup);

/**
 * GET /api/settings/:key
 * Renvoie un paramètre par clé :
 *   - clé = groupe entier → renvoie le groupe
 *   - clé = groupe.sousClé → renvoie la valeur
 * Ex: GET /api/settings/general.siteName
 *     GET /api/settings/navbar
 */
router.get('/:key', settingController.getByKey);

/**
 * PUT /api/settings/group/:group
 * Met à jour un groupe entier (merge profond avec l'existant).
 * Body = objet JSON du groupe.
 * Ex: PUT /api/settings/group/footer
 *     Body: { "brandPrimary": "Test" }
 */
router.put('/group/:group', settingController.updateGroup);

/**
 * PATCH /api/settings/:key
 * Met à jour UNE clé dans un groupe.
 * Ex: PATCH /api/settings/general.siteName
 *     Body: { "value": "Nouveau nom" }
 * Ex: PATCH /api/settings/navbar
 *     Body: { "value": { ...navbar complet... } }
 */
router.patch('/:key', settingController.updateSingle);

/**
 * POST /api/settings/reset
 * Réinitialise TOUS les paramètres aux valeurs par défaut.
 * ⚠️ Action destructive.
 */
router.post('/reset', settingController.reset);

export default router;