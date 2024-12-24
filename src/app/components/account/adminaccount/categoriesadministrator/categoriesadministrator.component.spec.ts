import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesadministratorComponent } from './categoriesadministrator.component';

describe('CategoriesadministratorComponent', () => {
  let component: CategoriesadministratorComponent;
  let fixture: ComponentFixture<CategoriesadministratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesadministratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesadministratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
