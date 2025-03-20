import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollHistoryComponent } from './poll-history.component';

describe('PollHistoryComponent', () => {
  let component: PollHistoryComponent;
  let fixture: ComponentFixture<PollHistoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PollHistoryComponent]
    });
    fixture = TestBed.createComponent(PollHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
