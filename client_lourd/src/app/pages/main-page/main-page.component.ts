/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DEFAULT_HOVER_INDEX } from '@app/constants/constants';

interface Screenshot {
    image: string;
    route: string;
    buttonDescription: string;
}

interface NavItem {
    title: string;
    description: string;
    screenshots: Screenshot[];
}

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
    @ViewChildren('button') buttons: QueryList<ElementRef>;
    @ViewChildren('img') screenshots: QueryList<ElementRef>;

    activeSlideIndex: number = 0;
    hoverIndex: number = DEFAULT_HOVER_INDEX;
    navInfo: NavItem[] = [
        {
            title: ' Jouer',
            description: 'Testez vos connaissances en joignant ou créant une partie!',
            screenshots: [
                {
                    image: 'joinGame.png',
                    route: '/game-home/joinGame',
                    buttonDescription: 'Joindre une partie',
                },
                {
                    image: 'create.png',
                    route: '/game-home/create',
                    buttonDescription: 'Créer une partie',
                },
                {
                    image: '',
                    route: '/game-home/lobby-list',
                    buttonDescription: 'Voir les parties',
                },
            ],
        },
        {
            title: 'Section chance',
            description: 'Tentez votre chance dans la section chance!',
            screenshots: [
                {
                    image: 'dailyFree.png',
                    route: '/luck/dailyFree',
                    buttonDescription: 'Prix Quotidien',
                },
                {
                    image: 'lootBox.png',
                    route: '/luck/lootBox',
                    buttonDescription: 'Ouvrir une LootBox',
                },
                {
                    image: 'coinFlip.png',
                    route: '/luck/coinFlip',
                    buttonDescription: 'Jouer au coin flip',
                },
            ],
        },
        {
            title: 'Administrer les quiz',
            description: 'Gérez et créez des quiz pour les utilisateurs!',
            screenshots: [
                {
                    image: 'quizList.png',
                    route: '/quiz-question-management/quizList',
                    buttonDescription: 'Gérer les quiz',
                },
                {
                    image: 'createQuiz.png',
                    route: '/quiz-question-management/createQuiz',
                    buttonDescription: 'Créer un quiz',
                },
                {
                    image: 'questionBank.png',
                    route: '/quiz-question-management/questionBank',
                    buttonDescription: 'Gérer les questions',
                },
            ],
        },
        {
            title: 'Inventaire',
            description: 'Gérez votre inventaire et vos objets!',
            screenshots: [
                {
                    image: 'inventory.png',
                    route: '/inventory',
                    buttonDescription: "Voir l'inventaire",
                },
            ],
        },
        {
            title: 'Boutique',
            description: 'Achetez des objets dans notre boutique!',
            screenshots: [
                {
                    image: 'shop.png',
                    route: '/shop-home/shop',
                    buttonDescription: 'Voir la boutique',
                },
                {
                    image: '',
                    route: '/shop-home/transfer',
                    buttonDescription: 'Transférer des coins',
                },
            ],
        },
    ];

    private buttonListeners: (() => void)[] = [];
    private screenshotListeners: (() => void)[] = [];

    constructor(
        private router: Router,
        public dialog: MatDialog,
    ) {
        this.activeSlideIndex = 0;
        this.hoverIndex = DEFAULT_HOVER_INDEX;
    }

    ngAfterViewInit(): void {
        this.addVisualEventListeners();
    }

    ngAfterViewChecked(): void {
        this.addVisualEventListeners();
    }

    ngOnDestroy(): void {
        this.removeVisualEventListeners();
    }
    setActiveSlideIndex(index: number): void {
        this.activeSlideIndex = index;
    }

    navigate(route: string): void {
        this.router.navigate([route]);
    }

    calculateTopPosition(index: number, length: number): number {
        if (length === 1) {
            return 10; // Center the single element
        } else if (length === 2) {
            return 5 + 40 * index; // Space out two elements
        } else {
            return 30 * index; // Default spacing for three elements
        }
    }

    calculateWidth(index: number, length: number): number {
        if (length === 1) {
            return 55; // Full width for single element
        } else if (length === 2) {
            return 70 - 20 * index; // Adjust width for two elements
        } else {
            return 85 - 15 * index; // Default width for three elements
        }
    }

    calculateImageWidth(length: number): number {
        if (length === 1) {
            return 60; // Full width for single element
        } else if (length === 2) {
            return 40; // Half width for two elements
        } else {
            return 33.33; // Default width for three elements
        }
    }

    calculateHeight(length: number): number {
        if (length === 1) {
            return 75; // Height for single element
        } else if (length === 2) {
            return 50; // Height for two elements
        } else {
            return 37; // Default height for three elements
        }
    }

    calculateRightPosition(index: number, length: number): string {
        const width = this.calculateWidth(index, length);
        const rightPosition = width;
        return `calc(${rightPosition}% - 200px)`;
    }

    private addVisualEventListeners(): void {
        this.removeVisualEventListeners();

        this.buttons.forEach((button) => {
            const line = button.nativeElement.previousElementSibling;
            const mouseOverListener = () => {
                line.style.backgroundColor = 'var(--secondary-color)';
                button.nativeElement.style.borderColor = 'var(--secondary-color)';
                button.nativeElement.style.background = 'linear-gradient(0deg, var(--secondary-color) 0%, var(--primary-color) 47.5%)';
            };
            const mouseOutListener = () => {
                line.style.backgroundColor = 'var(--tertiary-color)';
                button.nativeElement.style.borderColor = 'var(--tertiary-color)';
                button.nativeElement.style.background = 'var(--primary-color)';
            };
            button.nativeElement.addEventListener('mouseover', mouseOverListener);
            button.nativeElement.addEventListener('mouseout', mouseOutListener);

            this.buttonListeners.push(() => {
                button.nativeElement.removeEventListener('mouseover', mouseOverListener);
                button.nativeElement.removeEventListener('mouseout', mouseOutListener);
            });
        });

        this.screenshots.forEach((screenshot) => {
            const line = screenshot.nativeElement.nextElementSibling.querySelector('.line');
            const button = screenshot.nativeElement.nextElementSibling.querySelector('button');

            const mouseOverListener = () => {
                line.style.backgroundColor = 'var(--secondary-color)';
                button.style.borderColor = 'var(--secondary-color)';
                button.style.background = 'linear-gradient(0deg, var(--secondary-color) 0%, var(--primary-color) 47.5%)';
            };
            const mouseOutListener = () => {
                line.style.backgroundColor = 'var(--tertiary-color)';
                button.style.borderColor = 'var(--tertiary-color)';
                button.style.background = 'var(--primary-color)';
            };
            screenshot.nativeElement.addEventListener('mouseover', mouseOverListener);
            screenshot.nativeElement.addEventListener('mouseout', mouseOutListener);

            this.screenshotListeners.push(() => {
                screenshot.nativeElement.removeEventListener('mouseover', mouseOverListener);
                screenshot.nativeElement.removeEventListener('mouseout', mouseOutListener);
            });
        });
    }

    private removeVisualEventListeners(): void {
        this.buttonListeners.forEach((removeListener) => removeListener());
        this.screenshotListeners.forEach((removeListener) => removeListener());

        this.buttonListeners = [];
        this.screenshotListeners = [];
    }
}
