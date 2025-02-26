import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LootBoxPageComponent } from './loot-box-page.component';

describe('LootBoxPageComponent', () => {
  let component: LootBoxPageComponent;
  let fixture: ComponentFixture<LootBoxPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LootBoxPageComponent]
    });
    fixture = TestBed.createComponent(LootBoxPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
