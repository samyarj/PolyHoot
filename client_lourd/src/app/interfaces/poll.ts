import { Question } from './question';
export interface Poll {
    id?: string;
    title: string;
    description: string;
    questions: Question[];
    expired: boolean;
    expireDate: Date;
    isPublished?: boolean;
}

export interface PublishedPoll extends Poll {
    isPublished: true;
    publicationDate: string;
    endDate: string;
    totalVotes: number[][];
}
