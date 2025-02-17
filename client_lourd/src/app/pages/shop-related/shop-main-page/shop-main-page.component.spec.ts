import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopMainPageComponent } from './shop-main-page.component';

describe('ShopMainPageComponent', () => {
  let component: ShopMainPageComponent;
  let fixture: ComponentFixture<ShopMainPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShopMainPageComponent]
    });
    fixture = TestBed.createComponent(ShopMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
