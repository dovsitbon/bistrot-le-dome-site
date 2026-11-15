# Bistrot Le Dôme : infos à lui demander

Ce que le site affiche déjà vient de sa carte QR (WiiC), de sa fiche Google, de son ancien site CentralApp (bistrotledome.fr) et de son Instagram. Il reste à confirmer ou à compléter :

## À confirmer en priorité

1. **Les horaires exacts.** Le site affiche 11 h – 22 h tous les jours (fiche Google : « ouvert le dimanche », « ferme à 22:00 » relevé un dimanche). Son ancien site disait 8 h – minuit du lundi au samedi, fermé le dimanche, et son Instagram (2022) mardi – samedi 9 h 30 – 23 h. Préciser aussi : service continu ou coupure l'après-midi ? Heures de cuisine du midi et du soir ? → `data/horaires.json`
2. **Le happy hour** : toujours 17 h – 20 h du lundi au samedi ? → `data/horaires.json`
3. **La distance aux salons** : le brief disait « 3 minutes à pied ». Mesuré sur OpenStreetMap : 5 min jusqu'au boulevard Lefebvre (face aux pavillons), 7 min jusqu'à l'entrée principale. Le site dit donc 5 minutes. S'il connaît un passage plus court, on corrige.
4. **La capacité** : nombre de couverts, terrasse comprise, et nombre maximum pour un groupe ou une privatisation (le formulaire accepte 8 à 120 personnes pour l'instant). → `data/site.json` → `groups`
5. **Les noms de vins** mal saisis sur la carte QR, corrigés au mieux : Pauillac (« Héritage d'Orion » ?), Margaux « Duc de Fondalon », Saint-Estèphe « Fort du Mirail », Edmond de Rothschild (appellation ?). → `data/carte.json`

## À fournir

6. **Le prénom du patron ou du chef, et l'histoire du Dôme** (depuis quand, d'où vient le nom) : pour le bloc « Le bistrot » et la page Porte de Versailles.
7. **Le menu du jour au quotidien** : qui le met à jour, et comment (on peut lui montrer comment changer `data/menu-du-jour.json`, ou brancher une petite page d'administration plus tard).
8. **Une formule midi ou un menu entrée + plat + dessert** s'il en existe un (rien de tel sur la carte QR).
9. **Un portable** pour activer WhatsApp sur le site (le 09 87 76 60 20 est un fixe). → `data/site.json` → `whatsapp` (format 336XXXXXXXX)
10. **L'e-mail qui reçoit les réservations** : la carte QR affiche ledome92@gmail.com. Pour l'envoi automatique, il faut un compte Resend (gratuit jusqu'à 3 000 e-mails/mois) et, idéalement, un nom de domaine vérifié pour que la confirmation parte à ses clients. Variables Vercel : `RESEND_API_KEY`, `NOTIFY_EMAIL`, `RESEND_FROM`.
11. **Les langues parlées en salle** (anglais ? espagnol ? beaucoup d'avis viennent de touristes coréens : faut-il une version coréenne ?).
12. **Le logo en haute définition** : le site utilise le fichier vectoriel de son ancien site (lettrage « BISTROT LE DÔME » bleu nuit). Si l'enseigne ou les cartes ont une autre version, l'envoyer.
13. **SIRET, raison sociale et directeur de la publication** pour les mentions légales.
14. **Son accord pour reprendre 3 vrais avis Google** sur le site (`data/avis.json`).
15. **Les salons à venir à Paris Expo** qu'il veut annoncer dans le bandeau (`data/annonces.json`, avec dates de début et de fin).
16. **Bon cadeau et paiement en ligne** : les veut-il ? Le code est prêt mais désactivé (`data/site.json` → `giftCard`, `payment`).
17. **Livraison et vente à emporter** : son ancien site avait une page « Livraison & À emporter ». Toujours d'actualité ? Avec quelle plateforme ?
18. **Le nom de domaine** : bistrotledome.fr pointe aujourd'hui vers son ancien site CentralApp. Pour le faire pointer vers le nouveau site, il faut l'accès à son registrar (ou à CentralApp), puis relancer `npm run affichette` pour que le QR code utilise la bonne adresse.

## Photos

19. **Des photos des plats et de la salle** : voir `assets/A-PHOTOGRAPHIER.md`. En priorité le bœuf bourguignon, le confit de canard, l'entrecôte, la crème brûlée et l'équipe.
