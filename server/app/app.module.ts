import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/auth/auth.controller';
import { ChatChannelsController } from './controllers/chat-channels/chat-channels.controller';
import { HistoryController } from './controllers/history/history.controller';
import { LootBoxController } from './controllers/luck-related/lootbox-controller';
import { PasswordValidationController } from './controllers/password-validation/password-validation.controller';
import { QuestionController } from './controllers/question/question.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { ChatGateway } from './gateways/chat/chat.gateway';
import { CoinflipGateway } from './gateways/coinflip/coinflip.gateway';
import { ConnectionGateway } from './gateways/connection/connection.gateway';
import { GameGateway } from './gateways/game/game.gateway';
import { GameRecordSchema, gameRecordSchema } from './model/schema/game-record/game-record-schema';
import { Question, questionSchema } from './model/schema/question/question';
import { Quiz, quizSchema } from './model/schema/quiz/quiz';
import { FirebaseModule } from './modules/firebase.module';
import { UserService } from './services/auth/user.service';
import { ChatChannelsService } from './services/chat-channels/chat-channels.service';
import { ChatService } from './services/chat/chat.service';
import { CoinflipManagerService } from './services/coinflip-manager/coinflip-manager.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { GameRecordService } from './services/game-record/game-record.service';
import { HistoryManagerService } from './services/history-manager/history-manager.service';
import { LootBoxService } from './services/lootbox/lootbox.service';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: Quiz.name, schema: quizSchema },
            { name: Question.name, schema: questionSchema },
            { name: GameRecordSchema.name, schema: gameRecordSchema, collection: 'history' },
        ]),
        FirebaseModule,
    ],
    providers: [
        Logger,
        QuestionService,
        QuizService,
        ChatService,
        GameGateway,
        ChatGateway,
        CoinflipGateway,
        CoinflipManagerService,
        LootBoxService,
        GameRecordService,
        ConnectionGateway,
        GameManagerService,
        HistoryManagerService,
        UserService,
        ChatChannelsService,
    ],

    controllers: [
        QuestionController,
        QuizController,
        AuthController,
        PasswordValidationController,
        HistoryController,
        ChatChannelsController,
        LootBoxController,
    ],
})
export class AppModule {}
