/**
 * https://stackoverflow.com/questions/50443671/click-event-not-triggered-when-clicking-on-a-material-icon
 * https://stackoverflow.com/questions/42459768/how-to-manage-an-observable-stream-during-the-lifetime-of-a-router-component
 * https://www.freecodecamp.org/news/css-button-style-hover-color-and-background/
 * https://stackoverflow.com/questions/54971238/upload-json-file-using-angular-6
 * https://stackblitz.com/edit/angular-ivy-s6e8py?file=src%2Fapp%2Fapp.component.html
 * https://stackoverflow.com/questions/61573872/typescript-object-is-possibly-null-when-getting-files-from-event
 * https://stackoverflow.com/questions/43176560/property-files-does-not-exist-on-type-eventtarget-error-in-typescript
 * https://stackoverflow.com/questions/19643265/second-use-of-input-file-doesnt-trigger-onchange-anymore
 * https://stackoverflow.com/questions/48226868/document-getelementbyid-replacement-in-angular4-typescript
 * https://stackblitz.com/edit/at-dialog?file=src%2Fapp%2Fapp.component.html
 * https://stackoverflow.com/questions/49818921/how-to-properly-change-the-color-of-a-mat-icon-with-angular
 * Références pour le fichier test :
 * https://stackoverflow.com/questions/51970681/angular-jasmine-unit-test-change-event-for-inputtype-file
 * https://gist.github.com/amabes/88324d68690e0e7b8e313cd0cafaa219
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties
 * https://stackoverflow.com/questions/17885635/private-method-unit-testing-with-jasmine
 * https://stackoverflow.com/questions/40969759/how-can-i-mock-an-observable-throw-in-an-angular2-test
 * https://stackoverflow.com/questions/53615585/angular-7-catching-httperrorresponse-in-unit-tests
 * **/
// eliaszidane
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { backInLeftAnimation, backInRightAnimation, bounceOutAnimation, zoomInAnimation } from '@app/animations/animation';
import { AppRoute, ConfirmationMessage } from '@app/constants/enum-class';
import { Quiz } from '@app/interfaces/quiz';
import { AdminPageService } from '@app/services/admin-services/adminpage-service/admin-page.service';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';
import { MessageHandlerService } from '@app/services/general-services/error-handler/message-handler.service';
import { Observer } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
    animations: [backInLeftAnimation, backInRightAnimation, zoomInAnimation, bounceOutAnimation],
})
export class AdminPageComponent {
    @ViewChild('dialog') dialog: ElementRef;
    quizzes: Quiz[] = [];
    animateQuiz: { [quizTitle: string]: boolean } = {};
    title = new FormControl('');

    private quizToAdd: Quiz;

    private quizzesObserver: Partial<Observer<Quiz[]>> = {
        next: (quizzes: Quiz[]) => {
            this.quizzes = quizzes.filter((quiz) => quiz.title);
            this.quizzes = this.adminPageService.sortQuizByLastModified(this.quizzes);
        },
        error: (httpErrorResponse: HttpErrorResponse) => {
            this.messageHandlerService.popUpErrorDialog(httpErrorResponse.error.message);
        },
    };
    // constructeur a 4 parametres permis selon les charges et le prof, car 1 fichier = 1 responsabilité
    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private adminPageService: AdminPageService,
        private messageHandlerService: MessageHandlerService,
        private authentification: AuthentificationService,
    ) {
        this.adminPageService.getAllQuizzes().subscribe(this.quizzesObserver);
    }

    logOut() {
        this.authentification.unauthorize();
        this.router.navigate([AppRoute.HOME]);
    }

    toggleVisibility(quizId: string | undefined) {
        if (quizId) this.adminPageService.toggleQuizVisibility(quizId).subscribe(this.quizzesObserver);
    }

    export(quiz: Quiz) {
        this.adminPageService.exportToJSON(quiz);
    }

    isTitleUnique(): boolean {
        return this.title.value ? this.adminPageService.isQuizTitleUnique(this.title.value, this.quizzes) : true;
    }

    isTitleEmpty(): boolean {
        return this.title.value ? this.adminPageService.isStringEmpty(this.title.value) : true;
    }

    onClickHandleTitle() {
        if (this.title.value) {
            this.quizToAdd.title = this.title.value;
            this.adminPageService.createQuiz(this.quizToAdd).subscribe(this.quizzesObserver);
            this.dialog.nativeElement.close();
        }
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    goToEdit(id: string | undefined) {
        if (id) this.router.navigate(['quiz-question-management/modifierQuiz/' + id]);
    }

    trackByFn(_index: number, item: Quiz) {
        return item.id;
    }

    async handleFileImport(event: Event) {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;
        const file = input.files[0];
        try {
            const quiz: Quiz = await this.adminPageService.parseFile(file);
            this.handleErrors(quiz);
        } catch (error) {
            this.messageHandlerService.popUpErrorDialog(
                'Une erreur a eu lieu : <br>' + error + '<br>Assurez-vous de sélectionner un fichier de type JSON valide.',
            );
        }
        input.value = '';
    }

    delete(quizId: string | undefined) {
        if (quizId) this.messageHandlerService.confirmationDialog(ConfirmationMessage.DeleteGame, () => this.deleteCallback(quizId));
    }

    private deleteCallback(quizId: string) {
        this.adminPageService.deleteQuizById(quizId).subscribe(this.quizzesObserver);
    }

    private handleErrors(quiz: Quiz) {
        const errors: string[] = this.adminPageService.verifyImport(quiz);
        if (errors.length > 0) {
            this.adminPageService.makeErrorsPretty(errors);
            this.messageHandlerService.popUpErrorDialog('Il y a eu ' + errors.length + ' erreur(s) détectée(s) ' + errors);
        } else {
            this.adminPageService.processQuiz(quiz);
            this.handleTitle(quiz);
        }
    }

    private handleTitle(quiz: Quiz) {
        if (this.adminPageService.isQuizTitleUnique(quiz.title, this.quizzes)) {
            this.adminPageService.createQuiz(quiz).subscribe(this.quizzesObserver);
        } else {
            this.quizToAdd = quiz;
            this.dialog.nativeElement.showModal();
        }
    }
}
