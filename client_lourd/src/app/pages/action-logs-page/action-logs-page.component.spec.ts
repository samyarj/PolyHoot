import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionLogsPageComponent } from './action-logs-page.component';

describe('ActionLogsPageComponent', () => {
  let component: ActionLogsPageComponent;
  let fixture: ComponentFixture<ActionLogsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ActionLogsPageComponent]
    });
    fixture = TestBed.createComponent(ActionLogsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
