import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrCodePopInComponent } from './qr-code-pop-in.component';

describe('QrCodePopInComponent', () => {
  let component: QrCodePopInComponent;
  let fixture: ComponentFixture<QrCodePopInComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QrCodePopInComponent]
    });
    fixture = TestBed.createComponent(QrCodePopInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
