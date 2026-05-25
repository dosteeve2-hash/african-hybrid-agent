---
title: Pont avec Problem to Project Africa
sourceType: product
region: Afrique de l'Ouest
credibilityTier: medium
---

Problem to Project Africa transforme des problemes observes en pistes de projets, recommandations et opportunites. L'agent hybride africain peut servir de moteur de contexte : lorsqu'un profil mentionne un pays, un secteur, un probleme ou une competence, l'autre application appelle l'API evidence pour recevoir des extraits sourcables, tags, scores de fiabilite et raisons d'incertitude.

Exemple de flux : un utilisateur decrit un probleme agricole, educatif ou entrepreneurial. Problem to Project Africa construit un profil de recommandation. L'agent hybride transforme ce profil en requete, recupere les fragments pertinents du corpus, puis renvoie un paquet de preuves. L'application principale peut ensuite utiliser ces preuves pour eviter les recommandations vagues ou deconnectees du terrain.

Le pont doit rester simple : API HTTP, contrat stable, authentification optionnelle par cle, et donnees JSON. Cette separation permet de faire evoluer le corpus, les regles de source et le modele LLM sans casser l'experience de l'application principale.
