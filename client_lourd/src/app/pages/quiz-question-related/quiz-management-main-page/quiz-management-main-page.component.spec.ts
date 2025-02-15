import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizManagementMainPageComponent } from './quiz-management-main-page.component';

describe('QuizManagementMainPageComponent', () => {
  let component: QuizManagementMainPageComponent;
  let fixture: ComponentFixture<QuizManagementMainPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuizManagementMainPageComponent]
    });
    fixture = TestBed.createComponent(QuizManagementMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
