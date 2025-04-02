import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswerPollComponent } from './answer-poll.component';

describe('AnswerPollComponent', () => {
  let component: AnswerPollComponent;
  let fixture: ComponentFixture<AnswerPollComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AnswerPollComponent]
    });
    fixture = TestBed.createComponent(AnswerPollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
