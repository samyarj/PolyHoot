/* eslint-disable @typescript-eslint/no-magic-numbers */
import { AfterViewChecked, AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DEFAULT_HOVER_INDEX, NAV_ADMIN_INFO, NAV_PLAYER_INFO } from '@app/constants/constants';
import { User } from '@app/interfaces/user';
import { NavItem } from '@app/interfaces/ux-related';
import { AuthService } from '@app/services/auth/auth.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
    @ViewChildren('button') buttons: QueryList<ElementRef>;
    @ViewChildren('img') screenshots: QueryList<ElementRef>;
    @ViewChild('parentElement', { static: true }) parentElement: ElementRef;

    activeSlideIndex: number = 0;
    hoverIndex: number = DEFAULT_HOVER_INDEX;
    navInfo: NavItem[] = NAV_PLAYER_INFO;

    private buttonListeners: (() => void)[] = [];
    private screenshotListeners: (() => void)[] = [];

    constructor(
        private router: Router,
        public dialog: MatDialog,
        private authService: AuthService,
    ) {
        this.activeSlideIndex = 0;
        this.hoverIndex = DEFAULT_HOVER_INDEX;
        this.authService.user$.subscribe({
            next: (user: User | null) => {
                if (user?.role === 'admin') {
                    this.navInfo = NAV_ADMIN_INFO;
                } else {
                    this.navInfo = NAV_PLAYER_INFO;
                }
            },
        });
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
            return 30; // Full width for single element
        } else if (length === 2) {
            return 50 - 15 * index; // Adjust width for two elements
        } else {
            return 60 - 15 * index; // Default width for three elements
        }
    }

    calculateImageWidth(length: number): number {
        if (length === 1) {
            return 60; // Full width for single element
        } else if (length === 2) {
            return 40; // Half width for two elements
        } else {
            return 35; // Default width for three elements
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
        return `calc(${rightPosition}%)`;
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
