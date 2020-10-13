import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomClothesPageComponent } from './custom-clothes-page.component';

describe('CustomClothesPageComponent', () => {
  let component: CustomClothesPageComponent;
  let fixture: ComponentFixture<CustomClothesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomClothesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomClothesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
