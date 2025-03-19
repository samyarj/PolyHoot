import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultPollPageComponent } from './consult-poll-page.component';

describe('ConsultPollPageComponent', () => {
  let component: ConsultPollPageComponent;
  let fixture: ComponentFixture<ConsultPollPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultPollPageComponent]
    });
    fixture = TestBed.createComponent(ConsultPollPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
