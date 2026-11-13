# Migration TODO: Feature-Sliced Design (FSD)

**Общий аудит**: 56 файлов | 🔴 Высокий (>500 строк): 5 | 🟡 Средний (200-500): 19 | 🟢 Низкий (<200): 32

## 🔴 Фаза 1: Декомпозиция монолитов (Priority High)
- [x] `pages/staff/StaffCandidateDossier.tsx` (1887 → 653 строк) → декомпозирован в `widgets/dossier-viewer` и `features/dossier-modals`
- [x] `pages/staff/StaffDashboard.tsx` (1291 → 435 строк) → декомпозирован в `features/application-edit` и `widgets/candidate-registry`
- [x] `pages/VerifyCertificate.tsx` (1114 → 179 строк) → декомпозирован в `widgets/certificate-verification`
- [x] `components/Navbar.tsx` (592 → 4 строки) → декомпозирован в `widgets/navbar`
- [x] `components/home/StatisticsSection.tsx` (562 → 37 строк) → декомпозирован в `widgets/statistics`

## 🟡 Фаза 2: Компоненты средней сложности (Priority Medium)
- [ ] `pages/PartnerDetail.tsx` (471 строк) → `pages`
- [x] `pages/Apply.tsx` (463 → 264 строк) → декомпозирован в `widgets/apply-wizard` и `features/apply-form`
- [x] `pages/CertifiedUsers.tsx` (404 → 240 строк) → декомпозирован в `widgets/candidate-registry`
- [ ] `components/ui/CustomVideoPlayer.tsx` (367 строк) → `shared/ui`
- [x] `components/staff/StaffHeader.tsx` (390 → 4 строки) → декомпозирован в `widgets/staff-header`
- [ ] `api/staff.ts` (360 строк) → `entities/api`
- [ ] `pages/Experts.tsx` (337 строк) → `pages`
- [ ] `utils/kyrgyzPinValidator.ts` (336 строк) → `shared/lib`
- [x] `components/apply/StepProfession.tsx` (335 строк) → перенесен в `features/apply-form`
- [ ] `pages/AssessmentCenterDetail.tsx` (322 строк) → `pages`
- [ ] `components/ui/CallbackModal.tsx` (292 строк) → `shared/ui`
- [ ] `pages/ApplicationStatus.tsx` (287 строк) → `pages`
- [ ] `pages/NewsDetail.tsx` (281 строк) → `pages`
- [ ] `pages/Contacts.tsx` (258 строк) → `pages`
- [ ] `hooks/useApi.ts` (250 строк) → `shared/hooks`
- [ ] `pages/NewsList.tsx` (241 строк) → `pages`
- [x] `components/apply/StepPersonal.tsx` (233 строк) → перенесен в `features/apply-form`
- [x] `components/apply/PhotoCropperModal.tsx` (220 строк) → перенесен в `features/apply-form`
- [x] `components/CertifiedUserModal.tsx` (212 строк) → перенесен в `widgets/candidate-registry`

## 🟢 Фаза 3: Мелкие компоненты и утилиты (Priority Low)
- [x] `components/apply/StepDocuments.tsx` (178 строк) → перенесен в `features/apply-form`
- [ ] `pages/staff/StaffLogin.tsx` (153 строк) → `pages`
- [ ] `pages/AdditionalInfo.tsx` (150 строк) → `pages`
- [ ] `pages/AssessmentCenters.tsx` (128 строк) → `pages`
- [ ] `components/home/HeroSection.tsx` (110 строк) → `widgets`
- [ ] `pages/Partners.tsx` (109 строк) → `pages`
- [ ] `components/Footer.tsx` (108 строк) → `widgets`
- [ ] `pages/ImageGallery.tsx` (107 строк) → `pages`
- [ ] `pages/Management.tsx` (103 строк) → `pages`
- [ ] `components/home/ContactsSection.tsx` (94 строк) → `widgets`
- [ ] `pages/ProfStandards.tsx` (92 строк) → `pages`
- [ ] `pages/VideoGallery.tsx` (92 строк) → `pages`
- [x] `components/apply/StepConfirm.tsx` (86 строк) → перенесен в `features/apply-form`
- [ ] `components/home/NewsSection.tsx` (73 строк) → `widgets`
- [ ] `components/Toolbar.tsx` (61 строк) → `widgets`
- [ ] `components/ui/NewsCard.tsx` (60 строк) → `shared/ui`
- [ ] `components/ui/SocialLinks.tsx` (48 строк) → `shared/ui`
- [ ] `components/ui/SEO.tsx` (46 строк) → `shared/ui`
- [ ] `components/ui/DocumentCard.tsx` (33 строк) → `shared/ui`
- [ ] `pages/Home.tsx` (33 строк) → `pages`
- [ ] `pages/NotFound.tsx` (29 строк) → `pages`
- [ ] `utils/translateProfession.ts` (29 строк) → `shared/lib`
- [ ] `components/ScrollToTop.tsx` (27 строк) → `widgets`
- [ ] `api/client.ts` (23 строк) → `entities/api`
- [ ] `utils/transliterate.ts` (23 строк) → `shared/lib`
- [ ] `components/ui/PageHero.tsx` (19 строк) → `shared/ui`
- [ ] `components/ui/EmptyState.tsx` (16 строк) → `shared/ui`
- [ ] `components/ui/ErrorMessage.tsx` (16 строк) → `shared/ui`
- [ ] `utils/newsStore.ts` (15 строк) → `shared/lib`
- [ ] `components/ui/LoadingSkeleton.tsx` (14 строк) → `shared/ui`
- [ ] `components/ui/index.ts` (11 строк) → `shared/ui`
- [ ] `components/ui/Spinner.tsx` (7 строк) → `shared/ui`
