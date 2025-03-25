import { Question } from './question';
export interface Poll {
    id?: string;
    title: string;
    description: string;
    questions: Question[];
    expired: boolean;
    endDate?: string;
    isPublished: boolean;
}

export interface PublishedPoll extends Poll {
    isPublished: true;
    publicationDate: string;
    totalVotes: { [questionIndex: string]: number[] };
}
