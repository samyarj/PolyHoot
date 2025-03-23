import { Question } from './question';
export interface Poll {
    id?: string;
    title: string;
    description: string;
    questions: Question[];
    expired: boolean;
    endDate: Date;
    isPublished?: boolean;
}

export interface PublishedPoll extends Poll {
    isPublished: true;
    publicationDate: Date;
    totalVotes: number[][];
}
