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

## DÉCISIONS PRODUIT (à expliquer à Robert)

1. **Wishlist vide** → Illustration + "Ajoutez votre premier souhait" ✅
2. **Visiteur non connecté** → Voit la liste, bandeau "Connectez-vous pour contribuer" ✅
3. **Contribution minimum** → 1 EUR (configurable via env) ✅
4. **Montant non atteint** → Reste ouvert, propriétaire archive manuellement ✅
5. **Confidentialité** → Propriétaire voit total + nb contributeurs, jamais les noms ✅
6. **Item supprimé avec contributions** → Avertissement explicite avant suppression ✅
7. **Partage** → WhatsApp/Telegram/Email/Copier (public cible = mobile) ✅
8. **Temps réel** → WebSocket Socket.IO + polling fallback 10s ✅
9. **Wishlist expirée** → Détection auto par date, contributions bloquées, propriétaire peut prolonger ✅
10. **Modification contribution** → Modifier montant ou retirer sa participation ✅
