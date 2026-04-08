# Rapport de l'application web Gestion-services

## INTRODUCTION GÉNÉRALE

Cette application est une solution web pour la gestion des services, des demandes et des statistiques dans un contexte administratif. Elle combine un backend Laravel, un frontend React/Vite et un microservice Node/Express pour l’email et la réinitialisation de mot de passe.

Le présent document décrit l’architecture, le contexte du projet, l’analyse et la conception ainsi que la réalisation technique.

---

## CHAPITRE 1 : CONTEXTE GÉNÉRAL DU PROJET

### 1.1 Introduction

Le projet vise à faciliter la gestion des demandes de services, le suivi des utilisateurs, le traitement des importations de données et la production de statistiques. Il est conçu pour être utilisé par différents rôles : administrateur, président et service.

### 1.2 Présentation de l’organisme d’accueil

L’organisme d’accueil est une structure publique ou privée qui gère des demandes de service, des fichiers de personnel et des statistiques. Le logiciel fournit un tableau de bord centralisé, des rapports et une gestion de l’accès par rôle.

### 1.3 Cadre du projet

#### 1.3.1 Problématique

La gestion manuelle des demandes et des services est chronophage et sujette aux erreurs. Il fallait un système capable de centraliser les données, d’automatiser les workflows et de sécuriser l’accès.

#### 1.3.2 Analyse de l’existant

Avant ce projet, il n’y avait pas d’application unique pour gérer les demandes, les importations de personnel/bâtiments et l’envoi d’emails. Les processus étaient souvent fragmentés entre plusieurs outils.

#### 1.3.3 Solution proposée

La solution proposée est une application web modulable où :
- les utilisateurs se connectent via API,
- les administrateurs pilotent les imports et exportations,
- les services traitent les demandes,
- les statistiques sont produites automatiquement.

#### 1.3.4 Prototypage (Maquettes)

Le projet utilise une interface front-end React/Vite qui consomme l’API Laravel. Les maquettes prévoient des écrans de connexion, tableau de bord, gestion des demandes, recherche et notifications.

### 1.4 Analyse et spécification des besoins

#### 1.4.1 Besoins fonctionnels

- Authentification sécurisée via Sanctum
- Gestion de rôles (admin, president, service)
- Workflow de demandes CRUD
- Import/export Excel pour étudiants, personnel, bâtiments
- Téléchargement de fichiers et gestion des activités
- Envoi d’emails et code OTP pour mot de passe oublié
- Statistiques et tableau de bord

#### 1.4.2 Besoins non fonctionnels

- Performance et scalabilité avec API REST
- Sécurité des mots de passe et des tokens
- Résilience avec validation et limites de requêtes
- Compatibilité avec un microservice d’email
- Maintenance facile avec architecture Laravel MVC

### 1.5 Gestion du projet

Le projet est structuré autour de trois dossiers principaux :
- `backend/` pour le serveur Laravel,
- `frontend/` pour l’interface React,
- `secure-api/` pour la livraison d’emails et la gestion OTP.

### 1.6 Planification prévisionnelle

La planification typique du projet inclut :
- analyse des besoins,
- implémentation du backend,
- développement du frontend,
- intégration du microservice,
- tests et déploiement.

### 1.7 Conclusion

Le projet répond au besoin d’un outil centralisé et sécurisé pour la gestion des services, des demandes et des statistiques.

---

## CHAPITRE 2 : ANALYSE ET CONCEPTION

### 2.1 Introduction

Ce chapitre présente l’architecture logicielle, les choix techniques et les principaux composants du système.

### 2.2 Méthodes et outils de modélisation du projet

#### 2.2.1 Langage de modélisation (UML)

Le système peut être modélisé avec des diagrammes de cas d’utilisation, de classes et de séquence pour décrire les interactions entre les rôles et les API.

#### 2.2.2 Le processus unifié

Le projet suit un processus itératif avec des phases d’analyse, de conception, de développement et de tests.

#### 2.2.3 Identification des acteurs et des cas d’utilisation

Acteurs principaux :
- Administrateur,
- Président,
- Service,
- Utilisateur.

Cas d’utilisation :
- Authentifier,
- Gérer les demandes,
- Importer des fichiers,
- Consulter des statistiques,
- Réinitialiser le mot de passe.

### 2.3 Diagrammes de cas d’utilisation

Les cas d’utilisation couvrent :
- connexion déléguée,
- gestion de demandes,
- import/export de données,
- production de tableaux de bord,
- notifications et email.

### 2.4 Étude des diagrammes de séquences

Les séquences principales incluent :
- connexion utilisateur,
- envoi et vérification OTP,
- création/modification de demande,
- import de fichier Excel.

### 2.5 Diagramme de classes

L’application repose sur plusieurs modèles principaux :
- `User`,
- `Demande`,
- `Personnel`,
- `Student`,
- `Room`,
- `PasswordResetOtp`.

### 2.6 Conclusion

L’architecture choisie sépare clairement le backend, le frontend et le microservice email, ce qui facilite l’évolution et la maintenance.

---

## CHAPITRE 3 : RÉALISATION DU PROJET

### 3.1 Introduction

Ce chapitre décrit la mise en œuvre technique, les parties développées et les outils utilisés.

### 3.2 Architecture MVC (Par exemple)

Le backend Laravel suit le modèle MVC :
- Modèles dans `backend/app/Models`,
- Contrôleurs dans `backend/app/Http/Controllers`,
- Routes dans `backend/routes/api.php`.

### 3.3 Outils, langage et framework utilisés

- PHP 8.2, Laravel 12
- MySQL ou base de données relationnelle
- Laravel Sanctum pour l’authentification
- React + Vite pour le frontend
- Node/Express pour le microservice d’email
- Composer et npm pour la gestion des dépendances

### 3.4 Présentation et description des interfaces

L’application propose :
- écran de connexion,
- tableau de bord avec statistiques,
- pages de gestion des demandes,
- pages d’import/export,
- gestion de profil et mot de passe.

### 3.5 Conclusion

La réalisation combine une API sécurisée, une interface moderne et un service d’email dédié. Le système est prêt pour un usage en production après configuration des variables d’environnement.

---

## ANNEXE

### A. Structure du projet

- `backend/`
  - `app/`
  - `routes/api.php`
  - `composer.json`
- `frontend/`
  - `src/`
  - `package.json`
- `secure-api/`
  - `README.md`
  - `package.json`

### B. Routes clés du backend

- `POST /api/login`
- `POST /api/password/forgot`
- `POST /api/password/reset`
- `GET /api/demandes`
- `POST /api/import-etudiants`
- `GET /api/admin/stats`

### C. Variables d’environnement importantes

- Backend : `APP_URL`, `DB_*`, `SANCTUM_STATEFUL_DOMAINS`
- Secure API : `SMTP_USER`, `SMTP_PASS`, `PRESIDENT_EMAIL`, `SERVICE_EMAIL`, `DB_*`, `ALLOWED_ORIGINS`

## CONCLUSION GÉNÉRALE

Le projet Gestion-services est une application web structurée pour répondre aux besoins de gestion de demandes, import/export et statistiques. Son architecture modulaire en backend Laravel, frontend React et microservice Node garantit flexibilité, sécurité et évolutivité.

Pour aller plus loin, il est possible d’ajouter des tests automatisés, des rapports PDF, et une interface utilisateur plus complète pour les utilisateurs non-admin.
