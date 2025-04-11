import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './controllers/auth/auth.controller';
import { ChatChannelsController } from './controllers/chat-channels/chat-channels.controller';
import { CoinTransferController } from './controllers/coin-transfer.controller';
import { FriendSystemController } from './controllers/friend-system.controller';
import { InventoryController } from './controllers/inventory.controller';
import { LootBoxController } from './controllers/luck-related/lootbox-controller';
import { PasswordValidationController } from './controllers/password-validation/password-validation.controller';
import { PollController } from './controllers/poll-related/poll.controller';
import { PublishedPollController } from './controllers/poll-related/published-poll.controller';
import { QuestionController } from './controllers/question/question.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { ReportController } from './controllers/report.controller';
import { ShopController } from './controllers/shop.controller';
import { ChatGateway } from './gateways/chat/chat.gateway';
import { CoinflipGateway } from './gateways/coinflip/coinflip.gateway';
import { ConnectionGateway } from './gateways/connection/connection.gateway';
import { GameGateway } from './gateways/game/game.gateway';
import { Poll, pollSchema } from './model/schema/poll/poll';
import { PublishedPoll, publishedPollSchema } from './model/schema/poll/published-poll.schema';
import { Question, questionSchema } from './model/schema/question/question';
import { Quiz, quizSchema } from './model/schema/quiz/quiz';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { FirebaseModule } from './modules/firebase.module';
import { UserService } from './services/auth/user.service';
import { ChatChannelsService } from './services/chat-channels/chat-channels.service';
import { ChatService } from './services/chat/chat.service';
import { CoinflipManagerService } from './services/coinflip-manager/coinflip-manager.service';
import { GameManagerService } from './services/game-manager/game-manager.service';
import { InventoryService } from './services/inventory.service';
import { LootBoxService } from './services/lootbox/lootbox.service';
import { PollService } from './services/poll/poll.service';
import { PublishedPollService } from './services/poll/published-poll.service';
import { PushNotifService } from './services/push-notif/push-notif.service';
import { QuestionService } from './services/question/question.service';
import { QuickReplyService } from './services/quick-reply/quick-reply.service';
import { QuizAutofillService } from './services/quiz-autofill/quiz-autofill.service';
import { QuizService } from './services/quiz/quiz.service';
import { ShopService } from './services/shop.service';

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
            { name: Poll.name, schema: pollSchema },
            { name: PublishedPoll.name, schema: publishedPollSchema },
        ]),
        FirebaseModule,
        CloudinaryModule,
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
        InventoryService,
        ConnectionGateway,
        GameManagerService,
        UserService,
        ChatChannelsService,
        ShopService,
        PollService,
        PublishedPollService,
        PushNotifService,
        QuickReplyService,
        QuizAutofillService,
    ],

    controllers: [
        QuestionController,
        QuizController,
        AuthController,
        PasswordValidationController,
        ChatChannelsController,
        LootBoxController,
        InventoryController,
        ShopController,
        FriendSystemController,
        PollController,
        PublishedPollController,
        ReportController,
        CoinTransferController,
    ],
})
export class AppModule {}
