# SocialWishlist - Plan d'implémentation

> Test technique pour Robert. Objectif : produit fini, pas un prototype.

---

## ÉTAT ACTUEL - Ce qui est FAIT

### Phase 1 - Bloquants techniques ✅
- [x] OAuth Google (backend + frontend Google Sign-In)
- [x] Autofill par URL (scraping OG tags, JSON-LD, meta)
- [x] Docker Compose complet (PostgreSQL + Backend + Frontend)
- [x] WebSocket temps réel + polling fallback

### Phase 2 - Design & Polish ✅
- [x] Palette custom violet/purple (pas indigo par défaut)
- [x] Empty states avec SVG + CTA
- [x] Skeleton loading (shimmer animation)
- [x] Modales custom (plus de alert/confirm natifs)
- [x] Toast notifications (success/error/info, auto-dismiss)
- [x] Partage social (WhatsApp, Telegram, Email, copier lien)
- [x] Pages 404/erreur stylées
- [x] Favicon SVG + meta OG tags
- [x] Animations CSS (fadeIn, slideUp, scaleIn)
- [x] Mobile responsive (Tailwind breakpoints)

### Phase 3 - Cas limites (partiel) ✅
- [x] Suppression item avec avertissement contributions
- [x] Contribution minimum 1 EUR
- [x] Archivage wishlist (backend seulement)
- [x] Mise à jour/retrait contribution (backend seulement)

---

## CE QUI RESTE À FAIRE

### Phase 3 bis - Cas limites & finitions produit 🔧
> Ce que Robert teste : "solutions produit et cas limites"

- [ ] **3.1** UI archiver/désarchiver wishlist depuis le dashboard
  - Bouton archive sur la page propriétaire
  - Wishlist archivée = grisée dans le dashboard
  - Bloquer les contributions sur wishlist archivée (check backend)

- [ ] **3.2** UI modifier/retirer sa contribution
  - Bouton "Modifier" sur ItemCard quand l'utilisateur a déjà contribué
  - Permettre d'augmenter, diminuer ou retirer (montant = 0)
  - Mise à jour temps réel après modification

- [ ] **3.3** Auto-archivage wishlists expirées
  - Si event_date est passée → afficher comme archivée automatiquement
  - Message : "L'événement est passé" sur la page publique
  - Le propriétaire peut prolonger ou archiver manuellement

- [ ] **3.4** Vérification lien produit (scraping)
  - Lors du scraping, si le lien retourne 404 → avertir l'utilisateur
  - Badge "lien cassé" sur l'item si détecté

- [ ] **3.5** Empêcher contribution sur item fully funded
  - Masquer le bouton "Contribute" quand l'item est à 100%
  - Afficher "Fully funded!" à la place

### Phase 4 - Alembic & Déploiement 🚀
> Robert va visiter le site, s'inscrire et explorer

- [ ] **4.1** Configurer Alembic migrations
  - `alembic init`, `alembic.ini` configuré pour asyncpg
  - Migration initiale générée depuis les modèles existants
  - Script pour auto-migrate au démarrage Docker

- [ ] **4.2** Déploiement en production
  - Frontend : Vercel (ou autre)
  - Backend : Railway / Render
  - Base de données : PostgreSQL managé
  - Variables d'environnement configurées
  - HTTPS + domaine fonctionnel

### Phase 5 - Polish final (si temps restant) ✨
> "La finition - pour que le résultat ressemble à un produit fini"

- [ ] **5.1** Améliorer la landing page
  - Ajouter une démo visuelle / screenshot
  - Testimonials fictifs ou exemples d'utilisation
  - CTA plus impactant

- [ ] **5.2** Onboarding premier utilisateur
  - Après inscription, guider vers "Créer ma première liste"
  - Tooltip ou guide contextuel

- [ ] **5.3** Profil utilisateur
  - Page profil avec avatar, nom
  - Modifier son display_name

- [ ] **5.4** Notifications / historique contributions
  - Page "Mes contributions" pour voir ses participations
  - Historique des contributions passées

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

| Priorité | Tâche | Impact | Effort |
|----------|-------|--------|--------|
| 1 | 3.5 - Masquer bouton quand fully funded | Haut | Faible |
| 2 | 3.1 - UI archiver wishlist | Haut | Faible |
| 3 | 3.2 - UI modifier/retirer contribution | Haut | Moyen |
| 4 | 3.3 - Auto-archivage date expirée | Moyen | Faible |
| 5 | 3.4 - Badge lien cassé | Moyen | Faible |
| 6 | 4.1 - Alembic migrations | Moyen | Faible |
| 7 | 4.2 - Déploiement production | Critique | Moyen |
| 8 | 5.x - Polish final | Bonus | Variable |

---

## DÉCISIONS PRODUIT (à expliquer à Robert)

1. **Wishlist vide** → Illustration + "Ajoutez votre premier souhait" ✅
2. **Visiteur non connecté** → Voit la liste, bandeau "Connectez-vous pour contribuer" ✅
3. **Contribution minimum** → 1 EUR (configurable via env) ✅
4. **Montant non atteint** → Reste ouvert, propriétaire archive manuellement
5. **Confidentialité** → Propriétaire voit total + nb contributeurs, jamais les noms ✅
6. **Item supprimé avec contributions** → Avertissement explicite avant suppression ✅
7. **Partage** → WhatsApp/Telegram/Email/Copier (public cible = mobile) ✅
8. **Temps réel** → WebSocket Socket.IO + polling fallback 10s ✅
