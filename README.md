# Quizz React/socket.io/OpenAI
## Groupe: Walid HALLOULI, Fabien PONCET, Basile REGNAULT, Bilal BOUTERBIAT

 **Instruction de lancement**
 A la racine du projet, il faut exécuter la commande suivante : 
```Docker compose up -d```
Cela vous permettra de lancer les containers front et back afin qu'ils puissent fonctionner ensemble.

 **Clé API openAI**
 Nous avons essayé de créer une variable d'environnement en suivant la doc de NestJS mais malheureusement, pour quelconque raison, cela ne fonctionnait pas. Alors il faudra renseigner la clé API d'openAI directement dans le code comme ci dessous : 
 ![ApiKey](https://github.com/Yaamto/cicdproject/assets/73040102/f3fad5af-6cbd-4e4a-801d-164a5db2f019)
 
A la ligne 7 en remplaçant les guillemets par votre clé API.


 **Répartition des tâches**
 
  *Walid HALLOULI*: 
  - Set up du projet backend + frontend.
  - Assurer la connexion au socket depuis NextJs. 
  - Ajout du socket dans le store NextJs.
  - Assurer l'envoie des réponses lorsque l'on en sélectionne une durant une question (back + front).
  
  *Fabien PONCET*:
  - Création du prompt permettant de générer les questions et indices.
  - Structure du quizz (room, users, questions, etc..).
  - Personnalisation des avatars.
  - Page permettant de rejoindre les différentes room (front + back).
  
*Basile REGNAULT*:
- Création du quizz sur nextJs.
- Démarrage du quizz pour l'ensemble des joueurs qui se trouve dans la même room (back + front).
- Permettre de rejoindre une partie privée en renseignant l'id de la room (front + back).
- Gestion du calcul des points en fonction du temps restant (back).

*Bilal BOUTERBIAT*:
- Page nextJS permettant de créer une room.
- Faire en sorte de pouvoir rejoindre une partie en cours (front + back).
- Génération du timer côté back afin d'assurer la véracité du temps restant à l'ensemble des joueurs, puis pour les joueurs qui rejoigne en cours de partie (front + back).
- Renvoie des résultats des questions + les points entre chaque question (backend + frontend)


