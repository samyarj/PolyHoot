import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { EMPTY_STRING, MAX_CHOICES, MIN_CHOICES } from '@app/constants/constants';
import { ButtonType } from '@app/constants/enum-class';
import { EMPTY_QCM_QUESTION, EMPTY_QRE_QUESTION } from '@app/constants/mock-constants';
import { Question } from '@app/interfaces/question';
import { QuestionChoice } from '@app/interfaces/question-choice';
import { QuestionType } from '@app/interfaces/question-type';
import { ValidationService } from '@app/services/admin-services/validation-services/common-validation-service/validation.service';
import { QuestionValidationService } from '@app/services/admin-services/validation-services/question-validation-service/question-validation.service';
import { UploadImgService } from '@app/services/upload-img.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-question-form',
    templateUrl: './question-form.component.html',
    styleUrls: ['./question-form.component.scss'],
})
export class QuestionFormComponent implements OnChanges {
    @Input() question: Question;
    @Output() questionSubmitted = new EventEmitter<Question>();
    @Output() emptyQuestion = new EventEmitter<string>();
    @Input() showButton: boolean = true;
    @Input() submitButton: string = ButtonType.ADD;
    questionType: string = QuestionType.QCM;
    isTypeLocked: boolean = false;
    goodAnswer: number;
    minBound: number;
    maxBound: number;
    tolerance: number;
    isGeneratedQuestion: boolean = false;
    isReformulating: boolean = false;
    temporaryQuestionText: string = '';
    isChangingPicture: boolean = false;
    isCallingAI: boolean = false;
    constructor(
        private questionValidationService: QuestionValidationService,
        private commonValidationService: ValidationService,
        private toastr: ToastrService,
        private uploadImgService: UploadImgService,
        private http: HttpClient,
    ) {}

    submitQuestion() {
        if (this.question.type !== QuestionType.QCM) delete this.question['choices'];
        this.questionSubmitted.emit(this.question);
        this.resetAnswers();
    }

    toggleAnswer(choice: QuestionChoice): void {
        choice.isCorrect = !choice.isCorrect;
    }

    addAnswer(): void {
        if (this.question.choices && this.question.choices.length < MAX_CHOICES) this.question.choices.push({ text: EMPTY_STRING, isCorrect: false });
    }

    deleteAnswer(index: number): void {
        if (this.question.choices && this.question.choices.length > MIN_CHOICES) {
            this.question.choices.splice(index, 1);
        }
    }

    validateStep(value: number): boolean {
        return this.questionValidationService.validateStep(value);
    }

    validQuestion(): boolean {
        return this.questionValidationService.isQuestionValid(this.question);
    }

    resetAnswers(): void {
        this.isGeneratedQuestion = false;
        this.emptyQuestion.emit(this.questionType);
    }

    hasAtLeastOneTrueAndFalseChoice(): boolean {
        return this.questionValidationService.atLeastOneFalseAndOneTrue(this.question.choices);
    }

    drop(event: CdkDragDrop<QuestionChoice[]>) {
        if (this.question.choices) {
            moveItemInArray(this.question.choices, event.previousIndex, event.currentIndex);
        }
    }

    validUniqueChoiceTexts() {
        return this.commonValidationService.areTextsUnique(this.question.choices);
    }

    areQuestionChoicesTextValid() {
        return this.questionValidationService.areQuestionChoicesTextValid(this.question.choices);
    }

    isQuestionTextValid() {
        return this.commonValidationService.isStringEmpty(this.question.text);
    }

    onQuestionTypeChange() {
        this.isGeneratedQuestion = false;
        switch (this.questionType) {
            case QuestionType.QRL: {
                this.question.type = QuestionType.QRL;
                break;
            }
            case QuestionType.QCM: {
                this.question.type = QuestionType.QCM;
                this.question = JSON.parse(JSON.stringify(EMPTY_QCM_QUESTION));
                break;
            }
            case QuestionType.QRE: {
                this.question.type = QuestionType.QRE;
                this.question.qreAttributes = JSON.parse(JSON.stringify(EMPTY_QRE_QUESTION.qreAttributes));
                break;
            }
        }
    }

    ngOnChanges() {
        if (this.question) {
            if (this.question.text) {
                this.questionType = this.question.type;
                this.isTypeLocked = true;
            } else {
                this.question.type = this.questionType;
                this.isTypeLocked = false;
            }
        }
    }
    toleranceValid() {
        return this.questionValidationService.toleranceValid(this.question.qreAttributes);
    }
    minBoundValid() {
        return this.questionValidationService.minBoundValid(this.question.qreAttributes);
    }
    maxBoundValid() {
        return this.questionValidationService.maxBoundValid(this.question.qreAttributes);
    }
    goodAnswerValid() {
        return this.questionValidationService.goodAnswerValid(this.question.qreAttributes);
    }

    onFileSelectedAndUpload(event: Event): void {
        if (!this.isChangingPicture) {
            this.isChangingPicture = true;

            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) {
                this.toastr.warning('Aucun fichier sélectionné.');
                this.isChangingPicture = false;
                return;
            }

            // Téléversement immédiat après la sélection
            this.uploadImgService.uploadImage(file, 'question').subscribe({
                next: (response) => {
                    this.toastr.success('Image téléversée avec succès');

                    // Stockez l'URL de l'image pour l'afficher dans le formulaire
                    this.question.image = response.imageUrl;
                    const fileInput = event.target as HTMLInputElement;
                    if (fileInput) fileInput.value = ''; // Réinitialise l'input file
                    this.isChangingPicture = false;
                },
                error: (error) => {
                    this.toastr.error(`Erreur lors du téléversement : ${error.message}`);
                    this.isChangingPicture = false;
                },
            });
        }
    }
    deleteImage(): void {
        if (!this.isChangingPicture) {
            this.isChangingPicture = true;
            if (!this.question.image) {
                this.toastr.warning('Aucune image à supprimer.');
                this.isChangingPicture = false;
                return;
            }
            this.uploadImgService.deleteImage(this.question.image).subscribe({
                next: () => {
                    this.toastr.success('Image supprimée avec succès');
                    this.question.image = '';
                    this.isChangingPicture = false;
                },
            });
        }
    }

    generateQuestion(): void {
        if (!this.isCallingAI) {
            this.isCallingAI = true;
            this.http
                .post(`${environment.serverUrl}/quizzes/autofill`, { type: this.questionType })
                .pipe(
                    finalize(() => {
                        this.isCallingAI = false;
                    }),
                )
                .subscribe({
                    next: (response: any) => {
                        let generatedQuestion: Question = {
                            type: this.questionType,
                            points: 10,
                            text: '',
                        };

                        switch (this.questionType) {
                            case QuestionType.QCM: {
                                generatedQuestion = {
                                    ...generatedQuestion,
                                    text: response.Question,
                                    choices: Object.entries(response.Choix).map(([key, value]) => ({
                                        text: value as string,
                                        isCorrect: key === response.Réponse,
                                    })),
                                };
                                break;
                            }
                            case QuestionType.QRL: {
                                generatedQuestion = {
                                    ...generatedQuestion,
                                    text: response.Question,
                                };
                                break;
                            }
                            case QuestionType.QRE: {
                                generatedQuestion = {
                                    ...generatedQuestion,
                                    text: response.Question,
                                    qreAttributes: {
                                        goodAnswer: response['Bonne réponse'],
                                        minBound: response['Borne minimale'],
                                        maxBound: response['Borne maximale'],
                                        tolerance: response['Marge de tolérance'],
                                    },
                                };
                                break;
                            }
                        }
                        this.question = generatedQuestion;
                        this.isGeneratedQuestion = true;
                        this.toastr.success('Question générée avec succès');
                        this.isCallingAI = false;
                        // Automatically trigger reformulation after generation
                        this.reformulateQuestion();
                    },
                    error: (error) => {
                        this.toastr.error('Erreur lors de la génération de la question');
                        console.error('Error generating question:', error);
                        this.isCallingAI = false;
                    },
                });
        }
    }

    reformulateQuestion(): void {
        if (!this.isCallingAI) {
            this.isCallingAI = true;
            if (!this.question.text) {
                this.toastr.warning('Aucune question à reformuler');
                this.isCallingAI = false;
                return;
            }

            this.isReformulating = true;
            this.http
                .post(`${environment.serverUrl}/quizzes/reformulate-question`, { question: this.question.text })
                .pipe(
                    finalize(() => {
                        this.isCallingAI = false;
                    }),
                )
                .subscribe({
                    next: (response: any) => {
                        this.temporaryQuestionText = response.reformulatedQuestion;
                        this.toastr.success('Question reformulée avec succès');
                        this.isCallingAI = false;
                    },
                    error: (error) => {
                        this.toastr.error('Erreur lors de la reformulation de la question');
                        console.error('Error reformulating question:', error);
                        this.isReformulating = false;
                        this.isCallingAI = false;
                    },
                });
        }
    }

    acceptReformulation(): void {
        this.question.text = this.temporaryQuestionText;
        this.isReformulating = false;
        this.toastr.success('Reformulation acceptée');
    }

    rejectReformulation(): void {
        this.isReformulating = false;
        this.toastr.info('Reformulation rejetée');
    }

    onQuestionTextChange(): void {
        if (this.isGeneratedQuestion || !this.question.text) {
            this.isGeneratedQuestion = false;
        }
    }
}
