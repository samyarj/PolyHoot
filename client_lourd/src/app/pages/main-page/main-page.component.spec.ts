import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppRoute } from '@app/constants/enum-class';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { AuthentificationService } from '@app/services/admin-services/authentification-service/authentification.service';
import { of } from 'rxjs';

const NUMBER_OF_TEAM_MEMBERS = 6;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    const mockMatDialog = {
        open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of({}) }),
    };

    const mockRouter = {
        navigate: jasmine.createSpy('navigate'),
    };

    const mockAuthentificationService = {
        getStatus: jasmine.createSpy('getStatus'),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: AuthentificationService, useValue: mockAuthentificationService },
                { provide: MatDialog, useValue: mockMatDialog },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should navigate to /create when create button is pressed', () => {
        const createButton = fixture.debugElement.nativeElement.querySelector('.create-btn');
        createButton.click();
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.CREATE]);
    });

    it('should navigate to /login if admin button is pressed when user is not authentified', () => {
        mockAuthentificationService.getStatus.and.returnValue(false);
        const adminButton = fixture.debugElement.nativeElement.querySelector('.admin-btn');
        adminButton.click();
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.LOGIN]);
    });
    it('should navigate to /admin if admin button is pressed when user is authentified', () => {
        mockAuthentificationService.getStatus.and.returnValue(true);
        const adminButton = fixture.debugElement.nativeElement.querySelector('.admin-btn');
        adminButton.click();
        expect(mockRouter.navigate).toHaveBeenCalledWith([AppRoute.ADMIN]);
    });

    it('should contain the title and logo of website', () => {
        const compiled = fixture.nativeElement;
        const titleElement = compiled.querySelector('.title');
        const logoElement = compiled.querySelector('.logo');
        expect(titleElement.textContent).toBe('PolyHoot');
        expect(logoElement.tagName).toBe('IMG');
    });

    it('should contain the team number and members', () => {
        const compiled = fixture.nativeElement;
        const numberElement = compiled.querySelector('.team-number');
        const teamMembers = compiled.querySelectorAll('.team-members span');

        expect(numberElement.textContent).toContain('211');
        expect(teamMembers.length).toBe(NUMBER_OF_TEAM_MEMBERS);
    });
});
