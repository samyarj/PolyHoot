import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollMainPageComponent } from './poll-main-page.component';

describe('PollMainPageComponent', () => {
  let component: PollMainPageComponent;
  let fixture: ComponentFixture<PollMainPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PollMainPageComponent]
    });
    fixture = TestBed.createComponent(PollMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
