import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, authGuardAdmin, authGuardPlayer } from '@app/guards/auth.guard';
import { ActionLogsPageComponent } from '@app/pages/action-logs-page/action-logs-page.component';
import { PlayerInfoPageComponent } from '@app/pages/admin-pages/player-info-page/player-info-page.component';
import { ConsultPollPageComponent } from '@app/pages/admin-pages/poll-related/consult-poll-page/consult-poll-page.component';
import { CreatePollPageComponent } from '@app/pages/admin-pages/poll-related/create-poll-page/create-poll-page.component';
import { HistoryPollPageComponent } from '@app/pages/admin-pages/poll-related/history-poll-page/history-poll-page.component';
import { PollMainPageComponent } from '@app/pages/admin-pages/poll-related/poll-main-page/poll-main-page.component';
import { ForgotPasswordComponent } from '@app/pages/auth/forgot-password/forgot-password.component';
import { LoginPageComponent } from '@app/pages/auth/login-page/login-page.component';
import { SignUpComponent } from '@app/pages/auth/sign-up/sign-up.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GameMainPageComponent } from '@app/pages/game-related/game-main-page/game-main-page.component';
import { GamePageComponent } from '@app/pages/game-related/game-page/game-page.component';
import { JoinGamePageComponent } from '@app/pages/game-related/join-game-page/join-game-page.component';
import { OrganizerPageComponent } from '@app/pages/game-related/organizer-page/organizer-page.component';
import { ResultsPageComponent } from '@app/pages/game-related/results-page/results-page.component';
import { InventoryPageComponent } from '@app/pages/inventory-page/inventory-page.component';
import { CoinFlipPageComponent } from '@app/pages/luck-related/coin-flip-page/coin-flip-page.component';
import { DailyFreePageComponent } from '@app/pages/luck-related/daily-free-page/daily-free-page.component';
import { LootBoxPageComponent } from '@app/pages/luck-related/loot-box-page/loot-box-page.component';
import { LuckMainPageComponent } from '@app/pages/luck-related/luck-main-page/luck-main-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ProfilePageComponent } from '@app/pages/profile-page/profile-page.component';
import { AdminPageComponent } from '@app/pages/quiz-question-related/admin-page/admin-page.component';
import { AdminQuizCreateComponent } from '@app/pages/quiz-question-related/create-quiz/admin-create-quiz';
import { QuestionBankPageComponent } from '@app/pages/quiz-question-related/question-bank-page/question-bank-page.component';
import { QuizManagementMainPageComponent } from '@app/pages/quiz-question-related/quiz-management-main-page/quiz-management-main-page.component';
import { ShopMainPageComponent } from '@app/pages/shop-related/shop-main-page/shop-main-page.component';
import { ShopPageComponent } from '@app/pages/shop-related/shop-page/shop-page.component';
import { TransferPageComponent } from '@app/pages/shop-related/transfer-page/transfer-page.component';
import { GlobalChatComponent } from '@app/pages/test-components-page/global-chat.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    {
        path: 'home',
        component: MainPageComponent,
        canActivate: [authGuard],
    },

    { path: 'login', component: LoginPageComponent },
    { path: 'signup', component: SignUpComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },

    {
        path: 'quiz-question-management',
        component: QuizManagementMainPageComponent,
        canActivate: [authGuardPlayer],
        children: [
            { path: '', redirectTo: 'quizList', pathMatch: 'full' },
            { path: 'quizList', component: AdminPageComponent, canActivate: [authGuardPlayer] },
            { path: 'createQuiz', component: AdminQuizCreateComponent, canActivate: [authGuardPlayer] },
            { path: 'modifierQuiz/:id', component: AdminQuizCreateComponent, canActivate: [authGuardPlayer] },
            { path: 'questionBank', component: QuestionBankPageComponent, canActivate: [authGuardPlayer] },
        ],
    },
    { path: 'inventory', component: InventoryPageComponent, canActivate: [authGuardPlayer] },
    {
        path: 'game-home',
        component: GameMainPageComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'joinGame', pathMatch: 'full' },
            { path: 'joinGame', component: JoinGamePageComponent, canActivate: [authGuardPlayer] },
            { path: 'create', component: CreatePageComponent, canActivate: [authGuardPlayer] },
        ],
    },
    {
        path: 'shop-home',
        component: ShopMainPageComponent,
        canActivate: [authGuardPlayer],
        children: [
            { path: '', redirectTo: 'shop', pathMatch: 'full' },
            { path: 'shop', component: ShopPageComponent, canActivate: [authGuardPlayer] },
            { path: 'transfer', component: TransferPageComponent, canActivate: [authGuardPlayer] },
        ],
    },
    {
        path: 'luck',
        component: LuckMainPageComponent,
        canActivate: [authGuardPlayer],
        children: [
            { path: '', redirectTo: 'lootBox', pathMatch: 'full' },
            { path: 'lootBox', component: LootBoxPageComponent, canActivate: [authGuardPlayer] },
            { path: 'coinFlip', component: CoinFlipPageComponent, canActivate: [authGuardPlayer] },
            { path: 'dailyFree', component: DailyFreePageComponent, canActivate: [authGuardPlayer] },
        ],
    },

    { path: 'game', component: GamePageComponent, canActivate: [authGuardPlayer] },
    { path: 'results', component: ResultsPageComponent, canActivate: [authGuardPlayer] },
    { path: 'waiting', component: WaitingPageComponent, canActivate: [authGuardPlayer] },
    { path: 'organizer', component: OrganizerPageComponent, canActivate: [authGuardPlayer] },

    { path: 'global-chat', component: GlobalChatComponent, canActivate: [authGuard] },
    { path: 'profile', component: ProfilePageComponent, canActivate: [authGuardPlayer] },
    { path: 'profile/logs', component: ActionLogsPageComponent, canActivate: [authGuardPlayer] },

    { path: 'playerInfo', component: PlayerInfoPageComponent, canActivate: [authGuardAdmin] },
    {
        path: 'polls',
        component: PollMainPageComponent,
        canActivate: [authGuardAdmin],
        children: [
            { path: '', redirectTo: 'consult', pathMatch: 'full' },
            { path: 'consult', component: ConsultPollPageComponent, canActivate: [authGuardAdmin] },
            { path: 'create', component: CreatePollPageComponent, canActivate: [authGuardAdmin] },
            { path: 'modifyPoll/:id', component: CreatePollPageComponent, canActivate: [authGuardAdmin] },
            { path: 'history', component: HistoryPollPageComponent, canActivate: [authGuardAdmin] },
            { path: 'history/:id', component: HistoryPollPageComponent, canActivate: [authGuardAdmin] },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
