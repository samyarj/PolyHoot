/* eslint-disable @typescript-eslint/naming-convention */ // Constantes pour les messages d'erreurs
export const ERROR = {
    INTERNAL_SERVER_ERROR: 'Une erreur interne est survenue.',
    QUIZ: {
        ALREADY_EXISTS: 'Un quiz avec le meme titre existe deja.',
        ID_NOT_FOUND: 'Aucun quiz avec cet ID a ete trouve.',
        FAILED_TO_CREATE: 'Impossible de creer le quiz.',
        FAILED_TO_UPDATE: 'Impossible de mettre a jour le quiz.',
        LIST_FAILED_TO_LOAD: 'Erreur lors de la lecture des quiz dans la banque.',
        FAILED_TO_INSERT: "Erreur lors de l'insertion des quiz dans la base de donnees.",
    },
    QUESTION: {
        ALREADY_EXISTS: 'Une question avec le meme texte existe deja.',
        ID_NOT_FOUND: 'Aucune question avec ce ID a ete trouve.',
        FAILED_TO_CREATE: 'Impossible de creer la question',
        FAILED_TO_UPDATE: 'Impossible de mettre a jour la question',
        LIST_FAILED_TO_LOAD: 'Erreur lors de la lecture des questions dans la banque.',
        FAILED_TO_INSERT: "Erreur lors de l'insertion des quiz dans la base de donnees.",
    },

    HISTORY: {
        FAILED_TO_INSERT: "Erreur lors de l'insertion de l'historique des parties dans la base de donnees.",
        FAILED_TO_DELETE: "Erreur lors de la suppression de l'historique des parties.",
        LIST_FAILED_TO_LOAD: "Erreur lors de la lecture de l'historique des parties dans la base de donnees.",
    },
    POLL: {
        ALREADY_EXISTS: 'Un sondage avec le meme titre existe deja.',
        ID_NOT_FOUND: 'Aucun sondage avec cet ID a ete trouve.',
        FAILED_TO_CREATE: 'Impossible de creer le sondage.',
        FAILED_TO_UPDATE: 'Impossible de mettre a jour le sondage.',
        LIST_FAILED_TO_LOAD: 'Erreur lors de la lecture des sondages dans la banque.',
        FAILED_TO_INSERT: "Erreur lors de l'insertion des sondages dans la base de donnees.",
    }
};
