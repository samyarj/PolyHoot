import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LootBoxComponent } from './loot-box.component';

describe('LootBoxComponent', () => {
  let component: LootBoxComponent;
  let fixture: ComponentFixture<LootBoxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LootBoxComponent]
    });
    fixture = TestBed.createComponent(LootBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
