import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyFreePageComponent } from './daily-free-page.component';

describe('DailyFreePageComponent', () => {
  let component: DailyFreePageComponent;
  let fixture: ComponentFixture<DailyFreePageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyFreePageComponent]
    });
    fixture = TestBed.createComponent(DailyFreePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
