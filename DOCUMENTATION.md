# TECHNICAL DOCUMENTATION
# BINTANG PRASETYO PORTFOLIO (bprasety_.com)

## 01. PROJECT IDENTITY
**Project name:** Bintang Prasetyo Portfolio  
**Owner:** Bintang Prasetyo  
**Domain:** bprasety_.com  
**Purpose:** Premium personal portfolio, creative developer showcase, and digital studio presence.  
**Audience:** Potential clients, employers, creative technologists, and design enthusiasts.  
**Visual identity:** Minimalist, elegant, premium, clean, glossy, spatial, cinematic, modern, editorial, subtle, interactive.  
**UX philosophy:** Quiet confidence, technical capability, creative personality, visual sophistication. Everything is intentional, with generous negative space and smooth transitions.  
**Technical philosophy:** Modular, responsive, performant, accessible, secure, maintainable. No massive rewrites without justification. Graceful degradation for WebGL/3D effects.  

## 02. PRODUCT INFORMATION ARCHITECTURE
### Public
*   **Home:** Hero identity, short positioning, featured work.
*   **About:** Identity, story, background.
*   **Projects:** First-class portfolio content showcase.
*   **Gallery:** Artistic explorations (illustration, digital art, photography).
*   **Certificates:** Credentials and verified achievements.
*   **Commission:** Professional inquiry form.
*   **QnA:** Anonymous visitor messaging system.

### Admin (Hidden)
*   **Admin Login:** Secure entry point via email/password.
*   **Admin Dashboard:** Management interface for Projects, Gallery, Certificates, QnA, and Commissions.

## 03. USER FLOWS
**PUBLIC:**
Home → About → Projects → Gallery → Certificates → Commission → QnA

**ADMIN:**
Hidden trigger (5 clicks on name) → Login → Firebase Auth → Authorization → Dashboard

**QNA:**
Visitor → write → validate → spam protection → Firestore → success/error

## 04. DESIGN SYSTEM
*   **Colors:** Deep black, charcoal, off-white, muted gray. Restrained warm gold/accent.
*   **Typography:** Sophisticated Display, readable Body, concise Meta.
*   **Spacing & Grid:** Fluid, spatial composition with generous negative space.
*   **Breakpoints:** 320, 375, 390, 430, 768, 1024, 1440+
*   **Materials:** Subtle translucent layers, glass surfaces, reflections, soft highlights, shadow, blur.

*Note: Tokens are centralized via Tailwind CSS configuration and CSS variables.*

## 05. MOTION SYSTEM
*   **Elements:** Page transition, modal transition, hover, micro interactions, loading, parallax, optional WebGL.
*   **Behavior:** Smooth, controlled, cinematic, premium. Avoid bouncing or excessive spring.
*   **Accessibility:** Respects `prefers-reduced-motion` (reduces 3D, parallax, WebGL).

## 06. PAGE TRANSITION ARCHITECTURE
3D cinematic transition system using `motion`.
*   **Mechanism:** Entering/leaving pages utilize perspective, translate (X/Y/Z), scale, depth, opacity, and controlled blur.
*   **Fallback:** Simpler fade/scale on reduced motion or constrained devices.

## 07. COMPONENT ARCHITECTURE
*   `Navigation`: Minimal horizontal (desktop) / responsive menu (mobile).
*   `PageTransition`: Wrapper for cinematic route changes.
*   `Modal` / `Gallery Viewer`: Fullscreen overlays with keyboard/touch support.
*   `Button` / `Card` / `Form`: Reusable UI elements.

## 08. FEATURE ARCHITECTURE
*   **Projects / Gallery / Certificates:** Data-driven views. Input: Firestore data. State: Loading/Error/Loaded.
*   **Commission:** Form state (Idle, Submitting, Success, Error). Output: Firestore document.
*   **QnA:** Form state. Output: Firestore document (public write).
*   **Auth / Admin:** Firebase Auth state, protected routing.

## 09. CONTENT DATA MODEL
**PROJECTS:** `id`, `title`, `category`, `year`, `description`, `technologies`, `thumbnail`, `images`, `status`, `featured`, `externalUrl`, `caseStudy`
**GALLERY:** `id`, `title`, `category`, `year`, `image`, `description`
**CERTIFICATES:** `id`, `title`, `issuer`, `year`, `image`, `pdf`, `credentialId`, `verificationUrl`

## 10. FIREBASE ARCHITECTURE
**Firebase Project ID:** `[TODO: DECISION REQUIRED]`
**Firebase Console Project:** `[TODO: DECISION REQUIRED]`
*Note: Must be explicitly verified before Phase 6.*

## 11. FIREBASE INITIALIZATION
*   **Location:** `src/services/firebase/config.ts` (Planned)
*   **Behavior:** Singleton instance. No duplicate initialization.

## 12. ENVIRONMENT CONFIGURATION
**Development / Preview / Production**
*   **Variables:** `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc. (No secrets in docs).
*   **Commands:** `npm run dev`, `npm run build`.

## 13. AUTHENTICATION
*   **Mechanism:** EMAIL + PASSWORD via Firebase Auth (`signInWithEmailAndPassword`).
*   **Restrictions:** NO popups, NO social login, NO hardcoded passwords.

## 14. ADMIN AUTHORIZATION
*   **Mechanism:** `[TODO: DECISION REQUIRED - Firebase custom claims OR secure UID allowlist]`
*   **Enforcement:** Verified via Firestore Security Rules.

## 15. FIRESTORE COLLECTIONS
`projects`, `gallery`, `certificates`, `qna_messages`, `commission_requests`

## 16. FIRESTORE RULES
**PUBLIC:**
*   Read: Published projects, gallery, certificates.
*   Create: QnA messages, Commission requests (with rate limiting/validation).
**ADMIN:**
*   Read/Write/Delete: Full access to all collections.
*(Never use `allow read, write: if true;`)*

## 17. QNA SECURITY
*   Anonymous submission, input validation, honeypot spam protection.
*   Public cannot read other submissions.

## 18. COMMISSION SECURITY
*   States: New, Reviewing, Contacted, In Progress, Completed, Archived.
*   Admin-only read access.

## 19. ADMIN DASHBOARD
Modules: Overview, Projects, Gallery, Certificates, QnA, Commission, Settings.

## 20. ERROR ARCHITECTURE
Classes: NETWORK, CONFIGURATION, AUTHENTICATION, AUTHORIZATION, FIRESTORE, APPLICATION, PERFORMANCE, DEPLOYMENT.

## 21. PREVIOUS FAILURE PREVENTION
*   **Auth Popups / Blocked:** Prevented by strictly using Email/Password.
*   **Duplicate Initialization:** Prevented by singleton config pattern.
*   **Firestore connection timeout:** Robust error handling and network checks.

## 22. RESPONSIVE ARCHITECTURE
Mobile-first conceptual design, scaling up to ultrawide. Avoid horizontal overflow.

## 23. PERFORMANCE ARCHITECTURE
Image optimization, lazy loading, minimal dependencies, WebGL fallback.

## 24. ACCESSIBILITY
Semantic HTML, keyboard navigation, focus management, contrast, reduced motion.

## 25. SECURITY ARCHITECTURE
Firebase Auth + Firestore Rules + Environment Variables + Cloudflare.

## 26. CLOUDFLARE
Visitor → Cloudflare (DNS, CDN, Caching, WAF) → Host → Firebase.

## 27. DEPLOYMENT
Local → Git → Build → Preview → Production.

## 28. CHECKPOINT SYSTEM
*   [x] CP01 Foundation
*   [x] CP02 Design System
*   [x] CP03 Navigation
*   [ ] CP04 Content
*   [ ] CP05 Responsive
*   [ ] CP06 Firebase
*   [ ] CP07 Authentication
*   [ ] CP08 Firestore Rules
*   [ ] CP09 QnA
*   [ ] CP10 Dashboard
*   [ ] CP11 Cloudflare
*   [ ] CP12 Production

## 29. BACKUP / RECOVERY
Maintain Git history, document Firebase config separately, backup Firestore rules.

## 30. CHANGE MANAGEMENT
Architectural changes require documentation update (Reason, Risk, Affected modules).

## 31. TESTING STRATEGY
Verify public site, forms, auth, and performance manually/automatically.

## 32. CURRENT STATE / TARGET STATE
*   **UI/Architecture:** Foundation (Current) → Modular (Target)
*   **Firebase:** Uninitialized (Current) → Integrated (Target)

## 33. AI DEVELOPMENT HANDOFF
*   **Identity:** Premium portfolio for Bintang Prasetyo (bprasety_.com).
*   **DNA:** Minimal, glossy, spatial, cinematic transitions.
*   **Rules:** No Apple clones. No popups for auth. Modular structure required.
*   **Phase:** Phase 1 (Audit + Foundation).

## 34. PROJECT STATE
**CURRENT PHASE:** Phase 4 (Home - 360° Omnidirectional 3D Profile Card Complete)
**LAST VERIFIED CHECKPOINT:** CP04 (Content & 360° Interactive Spatial Card)
**NEXT TASK:** Phase 4 & 5 (Core Content Pages, About, Projects, Gallery)
**KNOWN RISKS:** None currently.
**OPEN DECISIONS:** Firebase Project ID, Admin Authorization Strategy.
