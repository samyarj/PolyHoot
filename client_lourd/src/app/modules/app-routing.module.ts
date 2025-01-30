import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';
import { AdminPageComponent } from '@app/pages/admin-related/admin-page/admin-page.component';
import { AdminQuizCreateComponent } from '@app/pages/admin-related/create-quiz/admin-create-quiz';
import { HistoryPageComponent } from '@app/pages/admin-related/history/history.component';
import { QuestionBankPageComponent } from '@app/pages/admin-related/question-bank-page/question-bank-page.component';
import { ForgotPasswordComponent } from '@app/pages/auth/forgot-password/forgot-password.component';
import { LoginPageComponent } from '@app/pages/auth/login-page/login-page.component';
import { SignUpComponent } from '@app/pages/auth/sign-up/sign-up.component';
import { CreatePageComponent } from '@app/pages/create-page/create-page.component';
import { GamePageComponent } from '@app/pages/game-related/game-page/game-page.component';
import { JoinGamePageComponent } from '@app/pages/game-related/join-game-page/join-game-page.component';
import { OrganizerPageComponent } from '@app/pages/game-related/organizer-page/organizer-page.component';
import { ResultsPageComponent } from '@app/pages/game-related/results-page/results-page.component';
import { TestGamePageComponent } from '@app/pages/game-related/test-page/test-game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { TestComponentsPageComponent } from '@app/pages/test-components-page/test-components-page.component';
import { WaitingPageComponent } from '@app/pages/waiting-page/waiting-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent, canActivate: [authGuard] },

    { path: 'login', component: LoginPageComponent },
    { path: 'signup', component: SignUpComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },

    { path: 'admin', component: AdminPageComponent, canActivate: [authGuard] },
    { path: 'admin/createQuiz', component: AdminQuizCreateComponent, canActivate: [authGuard] },
    { path: 'admin/modifierQuiz/:id', component: AdminQuizCreateComponent, canActivate: [authGuard] },

    { path: 'admin/questionBank', component: QuestionBankPageComponent, canActivate: [authGuard] },
    { path: 'admin/history', component: HistoryPageComponent, canActivate: [authGuard] },

    { path: 'game', component: GamePageComponent, canActivate: [authGuard] },
    { path: 'test-game/:id', component: TestGamePageComponent, canActivate: [authGuard] },
    { path: 'create', component: CreatePageComponent, canActivate: [authGuard] },
    { path: 'results', component: ResultsPageComponent, canActivate: [authGuard] },
    { path: 'waiting', component: WaitingPageComponent, canActivate: [authGuard] },
    { path: 'organizer', component: OrganizerPageComponent, canActivate: [authGuard] },
    { path: 'joinGame', component: JoinGamePageComponent, canActivate: [authGuard] },

    { path: 'test-components', component: TestComponentsPageComponent, canActivate: [authGuard] },

    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
