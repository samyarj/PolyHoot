import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryHeaderComponent } from './secondary-header.component';

describe('SecondaryHeaderComponent', () => {
  let component: SecondaryHeaderComponent;
  let fixture: ComponentFixture<SecondaryHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecondaryHeaderComponent]
    });
    fixture = TestBed.createComponent(SecondaryHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
