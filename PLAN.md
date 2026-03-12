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

### Phase 3 - Cas limites ✅
- [x] Suppression item avec avertissement contributions
- [x] Contribution minimum 1 EUR
- [x] **3.5** Masquer bouton Contribute sur item fully funded + badge "Fully funded!"
- [x] **3.1** UI archiver/désarchiver wishlist (bouton, badge, grisé, backend check)
- [x] **3.2** UI modifier/retirer sa contribution (edit, withdraw, affichage "Your contribution")
- [x] **3.3** Auto-détection wishlists expirées (event_date passée → message, contributions bloquées)
- [x] **3.4** Feedback lien cassé lors du scraping (toast info si URL inaccessible)

### Phase 4 - Alembic ✅
- [x] **4.1** Alembic configuré (async, migration initiale, auto-migrate au démarrage)

### Phase 5 - Polish final ✅
- [x] **5.1** Landing page améliorée (mockup app, occasions, 4 features, privacy section, CTA)
- [x] **5.2** Onboarding (welcome toast + auto-open create modal après inscription)
- [x] **5.3** Page profil (/profile, avatar, edit display_name, PUT /api/auth/me)
- [x] **5.4** Page Mes contributions (/contributions, GET /api/auth/me/contributions, historique)

---

## CE QUI RESTE À FAIRE

### Phase 4.2 - Déploiement 🚀
> Robert va visiter le site, s'inscrire et explorer

- [ ] **4.2** Déploiement en production
  - Frontend : Vercel (ou autre)
  - Backend : Railway / Render
  - Base de données : PostgreSQL managé
  - Variables d'environnement configurées
  - HTTPS + domaine fonctionnel
