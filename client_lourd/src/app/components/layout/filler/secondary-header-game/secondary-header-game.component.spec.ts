import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondaryHeaderGameComponent } from './secondary-header-game.component';

describe('SecondaryHeaderGameComponent', () => {
  let component: SecondaryHeaderGameComponent;
  let fixture: ComponentFixture<SecondaryHeaderGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SecondaryHeaderGameComponent]
    });
    fixture = TestBed.createComponent(SecondaryHeaderGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
