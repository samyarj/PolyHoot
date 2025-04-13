import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodeFriendPopInComponent } from './qr-code-friend-pop-in.component';

describe('QrCodePopInComponent', () => {
    let component: QrCodeFriendPopInComponent;
    let fixture: ComponentFixture<QrCodeFriendPopInComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QrCodeFriendPopInComponent],
        });
        fixture = TestBed.createComponent(QrCodeFriendPopInComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
