import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthentificationService } from './authentification.service';

describe('AuthentificationService', () => {
    let service: AuthentificationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(AuthentificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('authorize method should set authorization status to true', () => {
        service['isAuthorized'] = false;
        service.authorize();
        expect(service.getStatus()).toBeTrue();
    });

    it('unauthorize method should set authorization status to false', () => {
        service['isAuthorized'] = true;
        service.unauthorize();
        expect(service.getStatus()).toBeFalse();
    });

    it('getStatus method should return current authorization status ', () => {
        service['isAuthorized'] = false;
        expect(service.getStatus()).toBeFalse();
    });

    it('verifyPassword should send a post request to verify password', () => {
        const mockPassword = 'password123';
        service.verifyPassword(mockPassword).subscribe();
        const req = httpMock.expectOne(`${service['baseUrl']}`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ password: mockPassword });
    });
});
