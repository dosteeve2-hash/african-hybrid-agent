---
title: Architecture agent RAG pour LLM africain
sourceType: reference
region: Afrique
credibilityTier: high
---

Le prototype fonctionne comme un agent hybride. Il recoit une question, cherche dans un corpus local versionne, classe les extraits par pertinence, estime la fiabilite des sources, puis injecte ce contexte dans un modele de langage si une cle API est configuree. Sans modele externe, il renvoie une synthese locale des extraits afin de rester testable.

Cette architecture permet de construire progressivement un LLM africain sans pretendre entrainer immediatement un grand modele depuis zero. La premiere etape utile est de creer une couche de connaissance fiable : corpus, validation, retrieval, citations, audit, et API reutilisable par d'autres projets. L'entrainement ou le fine-tuning peut venir ensuite, quand les donnees sont propres, consenties, classees et gouvernees.

L'agent doit pouvoir travailler pour des cas pratiques : analyser un secteur, trouver des competences locales, proposer des pistes de projet, comparer des problemes terrain, et produire un paquet de preuves reutilisable par Problem to Project Africa. Chaque reponse doit montrer ce qui vient du corpus et ce qui reste a verifier.
