import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuckMainPageComponent } from './luck-main-page.component';

describe('LuckMainPageComponent', () => {
  let component: LuckMainPageComponent;
  let fixture: ComponentFixture<LuckMainPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LuckMainPageComponent]
    });
    fixture = TestBed.createComponent(LuckMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
