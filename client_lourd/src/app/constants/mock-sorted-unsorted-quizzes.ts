export const MOCK_UNSORTED_QUIZZES = [
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
        ],
    },
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
];

export const MOCK_SORTED_QUIZZES = [
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
        ],
    },
];
