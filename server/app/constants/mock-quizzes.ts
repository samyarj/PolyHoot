/* eslint-disable max-lines */ // Le fichier contient des donnees extensives pour tester tout les cas possibles
export const MOCK_QUIZZES = [
    {
        title: 'Quiz sur HTML',
        description: 'Testez vos connaissances sur HTML',
        duration: 45,
        lastModification: '2020-08-25T15:30:00+00:00',
        questions: [
            {
                type: 'QCM',
                text: 'Lequel des tags suivants est utilisé pour créer des hyperliens en HTML ?',
                points: 30,
                choices: [
                    { text: 'div', isCorrect: false },
                    { text: 'a', isCorrect: true },
                    { text: 'span', isCorrect: false },
                    { text: 'p', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Que signifie HTML ?',
                points: 40,
                choices: [
                    { text: 'HyperText Markup Language', isCorrect: true },
                    { text: 'Highly Typed Modeling Language', isCorrect: false },
                    { text: 'Hyperlink and Text Management Language', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Les bases de CSS',
        description: 'Testez votre compréhension des fondamentaux de CSS',
        duration: 40,
        lastModification: '2021-04-10T18:45:00+00:00',
        questions: [
            {
                type: 'QCM',
                text: "Quelle propriété est utilisée pour changer la couleur du texte d'un élément en CSS ?",
                points: 30,
                choices: [
                    { text: 'background-color', isCorrect: false },
                    { text: 'color', isCorrect: true },
                    { text: 'text-color', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Que fait la propriété 'display' en CSS ?",
                points: 20,
                choices: [
                    { text: 'Change la police de texte', isCorrect: false },
                    { text: "Modifie le comportement de mise en page d'un élément", isCorrect: true },
                    { text: "Ajuste la visibilité d'un élément", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Comment appliquer un style pour tous les éléments `<h1>` à l'intérieur des éléments `<div>` ?",
                points: 20,
                choices: [
                    { text: 'div + h1', isCorrect: false },
                    { text: 'div > h1', isCorrect: false },
                    { text: 'div h1', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: "Quelle propriété est utilisée pour créer de l'espace entre la bordure de l'élément et son contenu interne ?",
                points: 20,
                choices: [
                    { text: 'spacing', isCorrect: false },
                    { text: 'border', isCorrect: false },
                    { text: 'padding', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: "Quel est le but de la propriété 'overflow' en CSS ?",
                points: 20,
                choices: [
                    { text: "Spécifie ce qui se passe si le contenu déborde de la boîte d'un élément", isCorrect: true },
                    { text: 'Contrôle la mise en page des éléments flottants', isCorrect: false },
                    { text: "Définit le niveau d'opacité d'un élément", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Quelle propriété CSS contrôle la taille du texte ?',
                points: 20,
                choices: [
                    { text: 'text-style', isCorrect: false },
                    { text: 'font-style', isCorrect: false },
                    { text: 'font-size', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: 'Comment faites-vous une liste qui liste ses éléments avec des carrés ?',
                points: 20,
                choices: [
                    { text: 'list-style-type: square;', isCorrect: true },
                    { text: 'list-type: square;', isCorrect: false },
                    { text: 'list-style: square;', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Comment sélectionnez-vous un élément avec l'id 'demo' ?",
                points: 20,
                choices: [
                    { text: '#demo', isCorrect: true },
                    { text: '.demo', isCorrect: false },
                    { text: '*demo', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Quelle propriété est utilisée pour changer la police d'un élément ?",
                points: 20,
                choices: [
                    { text: 'font-weight', isCorrect: false },
                    { text: 'font-style', isCorrect: false },
                    { text: 'font-family', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: 'Comment insérez-vous un commentaire dans un fichier CSS ?',
                points: 20,
                choices: [
                    { text: '/* ceci est un commentaire */', isCorrect: true },
                    { text: '// ceci est un commentaire', isCorrect: false },
                    { text: "' ceci est un commentaire", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Quelle propriété est utilisée pour définir la couleur de fond d'un élément ?",
                points: 20,
                choices: [
                    { text: 'bgcolor', isCorrect: false },
                    { text: 'color', isCorrect: false },
                    { text: 'background-color', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: "Comment sélectionnez-vous des éléments avec le nom de classe 'example' ?",
                points: 20,
                choices: [
                    { text: '*example', isCorrect: false },
                    { text: '.example', isCorrect: true },
                    { text: '#example', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Que fait la propriété 'z-index' ?",
                points: 20,
                choices: [
                    { text: "Contrôle l'ordre de superposition vertical des éléments qui se chevauchent", isCorrect: true },
                    { text: "Change l'alignement horizontal du texte", isCorrect: false },
                    { text: "Ajuste le niveau de zoom d'un élément", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Que signifie CSS ?',
                points: 20,
                choices: [
                    { text: 'Computing Style Sheets', isCorrect: false },
                    { text: 'Creative Style Systems', isCorrect: false },
                    { text: 'Cascading Style Sheets', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: 'Quelle propriété CSS est utilisée pour cacher un élément ?',
                points: 20,
                choices: [
                    { text: 'visibility: hidden;', isCorrect: false },
                    { text: 'display: none;', isCorrect: true },
                    { text: 'opacity: 0;', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Quelle propriété est utilisée pour ajouter de l'espace entre les lettres ?",
                points: 20,
                choices: [
                    { text: 'spacing', isCorrect: false },
                    { text: 'letter-spacing', isCorrect: true },
                    { text: 'text-spacing', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Les bases de Python',
        description: 'Testez vos connaissances en programmation Python',
        duration: 50,
        lastModification: '2022-03-18T12:15:00+00:00',
        questions: [
            {
                type: 'QCM',
                text: 'Lequel des suivants est une manière correcte de commenter en Python ?',
                points: 30,
                choices: [
                    { text: '// Ceci est un commentaire', isCorrect: false },
                    { text: '# Ceci est un commentaire', isCorrect: true },
                    { text: '-- Ceci est un commentaire', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Quel est le résultat du code suivant : print(len('hello')) ?",
                points: 20,
                choices: [
                    { text: '5', isCorrect: true },
                    { text: '6', isCorrect: false },
                    { text: '1', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Concepts du développement web',
        description: 'Explorez votre compréhension des principes du développement web',
        duration: 35,
        lastModification: '2021-09-29T21:00:00+00:00',
        questions: [
            {
                type: 'QCM',
                text: 'Que signifie CSS ?',
                points: 30,
                choices: [
                    { text: 'Computer Style Sheets', isCorrect: false },
                    { text: 'Creative Style Sheets', isCorrect: false },
                    { text: 'Cascading Style Sheets', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: 'Quelle balise HTML est utilisée pour définir une liste non ordonnée ?',
                points: 20,
                choices: [
                    { text: '<ol>', isCorrect: false },
                    { text: '<ul>', isCorrect: true },
                    { text: '<li>', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Défi de programmation en C#',
        description: 'Testez vos connaissances des fonctionnalités et de la syntaxe du langage de programmation C#.',
        duration: 40,
        lastModification: '2024-03-10T14:45:00',
        questions: [
            {
                type: 'QCM',
                text: 'Quel est le but de l\'instruction "using" en C# ?',
                points: 20,
                choices: [
                    { text: 'Déclarer une variable', isCorrect: false },
                    { text: 'Inclure un espace de noms', isCorrect: true },
                    { text: 'Définir une méthode', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Quelle est la différence entre "==" et "===" en C# ?',
                points: 20,
                choices: [
                    { text: 'Aucune différence', isCorrect: false },
                    { text: "Comparaison d'égalité stricte", isCorrect: true },
                    { text: 'Comparaison de référence', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Lequel des suivants est un type valeur en C# ?',
                points: 30,
                choices: [
                    { text: 'String', isCorrect: false },
                    { text: 'int', isCorrect: true },
                    { text: 'Array', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Fondamentaux des WebSockets',
        description: 'Explorez les bases des WebSockets et de la communication en temps réel sur le web.',
        duration: 30,
        lastModification: '2024-03-15T09:30:00',
        questions: [
            {
                type: 'QCM',
                text: "Quel est l'avantage principal de l'utilisation des WebSockets par rapport aux connexions HTTP traditionnelles ?",
                points: 20,
                choices: [
                    { text: 'Faible latence et communication en temps réel', isCorrect: true },
                    { text: 'Meilleures fonctionnalités de sécurité', isCorrect: false },
                    { text: "Simplification de l'implémentation du serveur", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Quel code de statut HTTP est couramment utilisé pour passer à une connexion WebSocket ?',
                points: 20,
                choices: [
                    { text: '200 OK', isCorrect: false },
                    { text: '101 Changement de Protocoles', isCorrect: true },
                    { text: '404 Non Trouvé', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Défi du framework NestJS',
        description: 'Testez votre compréhension de NestJS, un puissant framework Node.js.',
        duration: 45,
        lastModification: '2024-03-20T12:00:00',
        questions: [
            {
                type: 'QCM',
                text: "Quel est le principal modèle d'architecture utilisé par NestJS ?",
                points: 30,
                choices: [
                    { text: 'Modèle-Vue-Contrôleur (MVC)', isCorrect: false },
                    { text: 'Modèle observateur', isCorrect: false },
                    { text: 'Injection de dépendance (DI)', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: 'Quel package est couramment utilisé pour gérer les requêtes HTTP dans NestJS ?',
                points: 20,
                choices: [
                    { text: 'express', isCorrect: true },
                    { text: 'koa', isCorrect: false },
                    { text: 'hapi', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Dans NestJS, quel est le but du décorateur @Injectable() ?',
                points: 30,
                choices: [
                    { text: 'Définir un service', isCorrect: true },
                    { text: 'Spécifier une route', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Quiz sur Angular',
        description: 'Testez vos connaissances sur Angular',
        duration: 45,
        lastModification: '2020-08-25T15:30:00+00:00',
        questions: [
            {
                type: 'QCM',
                text: 'Lequel des directives suivantes est utilisée pour boucler sur un tableau ?',
                points: 30,
                choices: [
                    { text: 'div', isCorrect: false },
                    { text: '*ngFor', isCorrect: true },
                    { text: 'span', isCorrect: false },
                    { text: 'p', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Que signifie HTML ?',
                points: 30,
                choices: [
                    { text: 'HyperText Markup Language', isCorrect: true },
                    { text: 'Highly Typed Modeling Language', isCorrect: false },
                    { text: 'Hyperlink and Text Management Language', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Quiz sur NestJs',
        description: 'Testez vos connaissances sur NestJs',
        duration: 45,
        lastModification: '2020-08-25T15:30:00+00:00',
        questions: [
            {
                type: 'QCM',
                text: 'Lequel des directives suivantes est utilisée pour boucler sur un tableau ?',
                points: 30,
                choices: [
                    { text: 'div', isCorrect: false },
                    { text: '*ngFor', isCorrect: true },
                    { text: 'span', isCorrect: false },
                    { text: 'p', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Que signifie HTML ?',
                points: 30,
                choices: [
                    { text: 'HyperText Markup Language', isCorrect: true },
                    { text: 'Highly Typed Modeling Language', isCorrect: false },
                    { text: 'Hyperlink and Text Management Language', isCorrect: false },
                ],
            },
        ],
    },
];
