import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollManagementComponent } from './poll-management.component';

describe('PollManagementComponent', () => {
  let component: PollManagementComponent;
  let fixture: ComponentFixture<PollManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PollManagementComponent]
    });
    fixture = TestBed.createComponent(PollManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
