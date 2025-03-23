import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePollPageComponent } from './create-poll-page.component';

describe('CreatePollPageComponent', () => {
  let component: CreatePollPageComponent;
  let fixture: ComponentFixture<CreatePollPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreatePollPageComponent]
    });
    fixture = TestBed.createComponent(CreatePollPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
