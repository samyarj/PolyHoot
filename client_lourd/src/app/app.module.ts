import { DragDropModule } from '@angular/cdk/drag-drop';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-related/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { WINDOW } from '@app/services/general-services/window.token';
import { NgChartsModule } from 'ng2-charts';
import { ToastrModule } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { ForgotPasswordFormComponent } from './components/auth/forgot-password-form/forgot-password-form.component';
import { LoginFormComponent } from './components/auth/login-form/login-form.component';
import { SignUpFormComponent } from './components/auth/sign-up-form/sign-up-form.component';
import { ChatComponent } from './components/chat/chat.component';
import { Chat2Component } from './components/chat/chat2/chat2.component';
import { AvatarBannerComponent } from './components/general-elements/avatar-banner/avatar-banner.component';
import { ConfirmationDialogComponent } from './components/general-elements/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from './components/general-elements/error-dialog/error-dialog.component';
import { LootBoxWinDialogComponent } from './components/general-elements/lootbox-win-dialog/lootbox-win-dialog.component';
import { PollPlayerPopInComponent } from './components/general-elements/poll-player-pop-in/poll-player-pop-in.component';
import { PopUpCreationComponent } from './components/general-elements/pop-up-creation/pop-up-creation.component';
import { HeaderGameComponent } from './components/layout/filler/header-game/header-game.component';
import { SecondaryHeaderGameComponent } from './components/layout/filler/secondary-header-game/secondary-header-game.component';
import { MainHeaderComponent } from './components/layout/main-header/main-header.component';
import { NotificationsComponent } from './components/layout/notifications/notifications.component';
import { SecondaryHeaderComponent } from './components/layout/secondary-header/secondary-header.component';
import { SideBarComponent } from './components/layout/side-bar/side-bar.component';
import { LootBoxComponent } from './components/loot-box/loot-box.component';
import { PlayerListComponent } from './components/player-list/player-list.component';
import { BankPanelComponent } from './components/quiz-related/bank-related/bank-panel/bank-panel.component';
import { QuestionBankComponent } from './components/quiz-related/bank-related/question-bank/question-bank.component';
import { QuestionTypeFilterComponent } from './components/quiz-related/bank-related/question-type-filter/question-type-filter.component';
import { CreateQuizComponent } from './components/quiz-related/quiz-creation/create-quiz/create-quiz.component';
import { QuestionFormComponent } from './components/quiz-related/quiz-creation/question-form/question-form.component';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { AppRoutingModule } from './modules/app-routing.module';
import { ActionLogsPageComponent } from './pages/action-logs-page/action-logs-page.component';
import { PlayerInfoPageComponent } from './pages/admin-pages/player-info-page/player-info-page.component';
import { ConsultPollPageComponent } from './pages/admin-pages/poll-related/consult-poll-page/consult-poll-page.component';
import { CreatePollPageComponent } from './pages/admin-pages/poll-related/create-poll-page/create-poll-page.component';
import { HistoryPollPageComponent } from './pages/admin-pages/poll-related/history-poll-page/history-poll-page.component';
import { PollMainPageComponent } from './pages/admin-pages/poll-related/poll-main-page/poll-main-page.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { LoginPageComponent } from './pages/auth/login-page/login-page.component';
import { SignUpComponent } from './pages/auth/sign-up/sign-up.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { GameMainPageComponent } from './pages/game-related/game-main-page/game-main-page.component';
import { JoinGamePageComponent } from './pages/game-related/join-game-page/join-game-page.component';
import { OrganizerPageComponent } from './pages/game-related/organizer-page/organizer-page.component';
import { ResultsPageComponent } from './pages/game-related/results-page/results-page.component';
import { InventoryPageComponent } from './pages/inventory-page/inventory-page.component';
import { CoinFlipPageComponent } from './pages/luck-related/coin-flip-page/coin-flip-page.component';
import { DailyFreePageComponent } from './pages/luck-related/daily-free-page/daily-free-page.component';
import { LootBoxPageComponent } from './pages/luck-related/loot-box-page/loot-box-page.component';
import { LuckMainPageComponent } from './pages/luck-related/luck-main-page/luck-main-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { AdminPageComponent } from './pages/quiz-question-related/admin-page/admin-page.component';
import { AdminQuizCreateComponent } from './pages/quiz-question-related/create-quiz/admin-create-quiz';
import { HistoryPageComponent } from './pages/quiz-question-related/history/history.component';
import { QuestionBankPageComponent } from './pages/quiz-question-related/question-bank-page/question-bank-page.component';
import { QuizManagementMainPageComponent } from './pages/quiz-question-related/quiz-management-main-page/quiz-management-main-page.component';
import { ShopMainPageComponent } from './pages/shop-related/shop-main-page/shop-main-page.component';
import { ShopPageComponent } from './pages/shop-related/shop-page/shop-page.component';
import { TransferPageComponent } from './pages/shop-related/transfer-page/transfer-page.component';
import { GlobalChatComponent } from './pages/test-components-page/global-chat.component';
import { WaitingPageComponent } from './pages/waiting-page/waiting-page.component';
import { AuthService } from './services/auth/auth.service';
import { QuestionService } from './services/back-end-communication-services/question-service/question.service';
import { QuizService } from './services/back-end-communication-services/quiz-service/quiz.service';
import { FirebaseChatService } from './services/chat-services/firebase/firebase-chat.service';
import { FriendSystemService } from './services/friend-system.service'; // Import the service
import { FrenchPaginatorIntlService } from './services/general-services/french-paginator/french-paginator-intl.service';
import { InventoryService } from './services/general-services/inventory.service';
import { GlobalErrorHandlerService } from './services/global-error-handler.service';
import { ReportService } from './services/report-service';
import { HeaderNavigationService } from './services/ui-services/header-navigation.service';
import { ThemeService } from './services/ui-services/theme/theme.service';
import { SocketClientService } from './services/websocket-services/general/socket-client-manager.service';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        LoginPageComponent,
        AdminPageComponent,
        HeaderGameComponent,
        AdminQuizCreateComponent,
        CreateQuizComponent,
        QuestionBankPageComponent,
        QuestionFormComponent,
        ChatComponent,
        CreatePageComponent,
        BankPanelComponent,
        QuestionBankComponent,
        PopUpCreationComponent,
        ErrorDialogComponent,
        LootBoxWinDialogComponent,
        ResultsPageComponent,
        WaitingPageComponent,
        OrganizerPageComponent,
        JoinGamePageComponent,
        QuestionTypeFilterComponent,
        HistoryPageComponent,
        PlayerListComponent,
        ConfirmationDialogComponent,
        SignUpFormComponent,
        SignUpComponent,
        LoginFormComponent,
        ForgotPasswordComponent,
        ForgotPasswordFormComponent,
        GlobalChatComponent,
        Chat2Component,
        SideBarComponent,
        MainHeaderComponent,
        GameMainPageComponent,
        SecondaryHeaderComponent,
        SecondaryHeaderGameComponent,
        QuizManagementMainPageComponent,
        LuckMainPageComponent,
        LootBoxPageComponent,
        CoinFlipPageComponent,
        DailyFreePageComponent,
        InventoryPageComponent,
        ShopPageComponent,
        ShopMainPageComponent,
        TransferPageComponent,
        LootBoxComponent,
        ProfilePageComponent,
        AvatarBannerComponent,
        ActionLogsPageComponent,
        PlayerInfoPageComponent,
        HistoryPollPageComponent,
        ConsultPollPageComponent,
        CreatePollPageComponent,
        PollMainPageComponent,
        PollPlayerPopInComponent,
        NotificationsComponent,
    ],
    providers: [
        AuthService,
        QuizService,
        QuestionService,
        SocketClientService,
        FirebaseChatService,
        ThemeService,
        InventoryService,
        HeaderNavigationService,
        FriendSystemService,
        ReportService,
        { provide: WINDOW, useValue: window },
        { provide: MatPaginatorIntl, useClass: FrenchPaginatorIntlService },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        { provide: ErrorHandler, useClass: GlobalErrorHandlerService },
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        DragDropModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatCardModule,
        MatExpansionModule,
        MatIconModule,
        NgChartsModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        provideDatabase(() => getDatabase()),
        ToastrModule.forRoot({
            timeOut: 3500,
            positionClass: 'toast-top-center',
            closeButton: true,
        }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
