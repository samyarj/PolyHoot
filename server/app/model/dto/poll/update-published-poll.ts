import { PartialType } from '@nestjs/mapped-types';
import { CreatePublishedPollDto } from './create-published-poll.dto';

export class UpdatePublishedPollDto extends PartialType(CreatePublishedPollDto) {}
