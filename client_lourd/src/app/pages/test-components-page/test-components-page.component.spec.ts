import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestComponentsPageComponent } from './test-components-page.component';

describe('TestComponentsPageComponent', () => {
  let component: TestComponentsPageComponent;
  let fixture: ComponentFixture<TestComponentsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponentsPageComponent]
    });
    fixture = TestBed.createComponent(TestComponentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
