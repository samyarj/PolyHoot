import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinFlipPageComponent } from './coin-flip-page.component';

describe('CoinFlipPageComponent', () => {
  let component: CoinFlipPageComponent;
  let fixture: ComponentFixture<CoinFlipPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoinFlipPageComponent]
    });
    fixture = TestBed.createComponent(CoinFlipPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
