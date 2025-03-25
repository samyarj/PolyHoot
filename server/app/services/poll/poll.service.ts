import { ERROR } from '@app/constants/error-messages';
import { CreatePollDto } from '@app/model/dto/poll/create-poll.dto';
import { UpdatePollDto } from '@app/model/dto/poll/update-poll.dto';
import { Poll } from '@app/model/schema/poll/poll';
import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PollService {
    private firestore = admin.firestore();

    async getAllPolls(): Promise<Poll[]> {
        const snapshot = await this.firestore.collection('polls').get();
        return snapshot.docs.map((doc) => doc.data() as Poll);
    }

    async getPollById(id: string): Promise<Poll> {
        const pollRef = this.firestore.collection('polls').doc(id);
        const pollDoc = await pollRef.get();

        if (!pollDoc.exists) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }

        return pollDoc.data() as Poll;
    }

    async createPoll(createPollDto: CreatePollDto): Promise<void> {
        const pollRef = this.firestore.collection('polls').doc();
        const poll: Poll = {
            id: pollRef.id,
            ...createPollDto,
        };
        await pollRef.set(poll);
    }

    async deletePollById(id: string): Promise<void> {
        const pollRef = this.firestore.collection('polls').doc(id);
        const pollDoc = await pollRef.get();

        if (!pollDoc.exists) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }
        await pollRef.delete();
    }

    async updatePoll(id: string, updatePollDto: UpdatePollDto): Promise<void> {
        const pollRef = this.firestore.collection('polls').doc(id);
        const pollDoc = await pollRef.get();

        if (!pollDoc.exists) {
            throw new NotFoundException(ERROR.POLL.ID_NOT_FOUND);
        }

        // Convertir UpdatePollDto en un objet compatible avec Firestore
        const updatePayload: { [key: string]: any } = {
            title: updatePollDto.title,
            description: updatePollDto.description,
            expired: updatePollDto.expired,
            isPublished: updatePollDto.isPublished,
            questions: updatePollDto.questions.map((question) => ({
                ...question,
                // Si nécessaire, ajoutez des propriétés manquantes pour correspondre au type Question
            })),
        };
        await pollRef.update(updatePayload);
    }
}
