import { animate, animation, query, stagger, style, transition, trigger, useAnimation } from '@angular/animations';
import { backInLeft, backInRight, bounceIn, bounceOut, tada, zoomIn } from 'ng-animate';

const DEFAULT_TIMING = 1;
const SLOW_TIMING = 1.2;
const MIN_OPACITY = 0;

const QUESTION_ANIMATION_TIMING = 0.8;
const DELETE_QUESTION_ANIMATION_TIMING = 0.7;
const ADD_QUESTION_ANIMATION_TIMING = 0.5;
const QUESTION_ANIMATION_DELAY = 0.5;
const ZOOM_IN_ANIMATION_TIMING = 0.7;
const ZOOM_IN_ANIMATION_DELAY = 0.6;

export const zoomInWithInitialOpacity = animation([style({ opacity: MIN_OPACITY }), useAnimation(zoomIn)]);

export const backInLeftAnimation = trigger('backInLeft', [transition(':enter', useAnimation(backInLeft, { params: { timing: SLOW_TIMING } }))]);

export const backInRightAnimation = trigger('backInRight', [transition(':enter', useAnimation(backInRight, { params: { timing: SLOW_TIMING } }))]);

export const zoomInAnimation = trigger('zoomIn', [
    transition(':enter', useAnimation(zoomInWithInitialOpacity, { params: { timing: ZOOM_IN_ANIMATION_TIMING, delay: ZOOM_IN_ANIMATION_DELAY } })),
]);

export const bounceOutAnimation = trigger('bounceOut', [transition(':leave', useAnimation(bounceOut, { params: { timing: DEFAULT_TIMING } }))]);

export const slideDownAnimation = trigger('slideDown', [
    transition(':enter', [style({ transform: 'translateY(-100%)' }), animate('0.4s ease-out', style({ transform: 'translateY(0)' }))]),
]);

export const fadeInStaggerAnimation = trigger('fadeInStagger', [
    transition('* <=> *', [
        query(':enter', style({ opacity: MIN_OPACITY }), { optional: true }),
        query(':enter', stagger('180ms', [animate('.3s .3s ease-in', style({ opacity: DEFAULT_TIMING }))]), { optional: true }),
    ]),
]);

export const addQuestionAnimation = trigger('zoomIn', [
    transition(':enter', useAnimation(zoomIn), { params: { timing: ADD_QUESTION_ANIMATION_TIMING } }),
]);

export const deleteQuestionAnimation = trigger('bounceOut', [
    transition(':leave', useAnimation(bounceOut), { params: { timing: DELETE_QUESTION_ANIMATION_TIMING } }),
]);

export const questionFormAnimation = trigger('questionFormAnimation', [
    transition(':enter', useAnimation(tada), { params: { timing: QUESTION_ANIMATION_TIMING, delay: QUESTION_ANIMATION_DELAY } }),
]);

export const gameFormAnimation = trigger('gameFormAnimation', [transition(':enter', useAnimation(bounceIn), { params: { timing: DEFAULT_TIMING } })]);

export const playerJoinAnimation = trigger('popIn', [
    transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', style({ transform: 'scale(1)', opacity: 1 })),
    ]),
]);

export const playerLeftAnimation = trigger('popOut', [
    transition(':leave', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', style({ transform: 'scale(0)', opacity: 0 })),
    ]),
]);

export const moveUpAnimation = trigger('moveUp', [
    transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('1s  cubic-bezier(.8, -0.6, 0.2, 1.5)', style({ transform: 'translateY(0)' })),
    ]),
]);

export const moveDownAnimation = trigger('moveDown', [
    transition(':leave', [animate('1s cubic-bezier(.8, -0.6, 0.2, 1.5)', style({ transform: 'translateY(100%)' }))]),
]);
