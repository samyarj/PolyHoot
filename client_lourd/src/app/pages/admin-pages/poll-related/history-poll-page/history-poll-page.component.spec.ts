import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryPollPageComponent } from './history-poll-page.component';

describe('HistoryPollPageComponent', () => {
  let component: HistoryPollPageComponent;
  let fixture: ComponentFixture<HistoryPollPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HistoryPollPageComponent]
    });
    fixture = TestBed.createComponent(HistoryPollPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
