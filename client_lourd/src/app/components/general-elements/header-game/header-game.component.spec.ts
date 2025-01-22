// https://aiko.dev/angular_test_input_decorator/

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoute } from '@app/constants/enum-class';
import { HeaderGameComponent } from './header-game.component';

@Component({
    selector: 'app-header-host-component',
    template: '<app-header-game [title]="inputTest"></app-header-game>',
})
class TestHostComponent {
    inputTest: string = 'test title';
    onLogoClick: jasmine.Spy<() => void> | undefined;
}

describe('HeaderGameComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderGameComponent, TestHostComponent],
            imports: [RouterTestingModule],
        });
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
    });

    it('title shown should be the one passed in input', () => {
        expect(testHostFixture.nativeElement.querySelector('#title').innerText).toEqual(testHostComponent.inputTest);
    });

    it('should navigate to specified page on redirectToPage()', () => {
        const headerGameComponent = testHostFixture.debugElement.query(By.directive(HeaderGameComponent)).componentInstance;
        const routerSpy = spyOn(headerGameComponent['router'], 'navigate');
        headerGameComponent.redirectToPage();
        expect(routerSpy).toHaveBeenCalledWith([AppRoute.HOME]);
    });

    it('should call onLogoClick function if exists', () => {
        const headerGameComponent = testHostFixture.debugElement.query(By.directive(HeaderGameComponent)).componentInstance;
        headerGameComponent.onLogoClick = jasmine.createSpy('onLogoClick');
        headerGameComponent.redirectToPage();
        expect(headerGameComponent.onLogoClick).toHaveBeenCalled();
    });
});
