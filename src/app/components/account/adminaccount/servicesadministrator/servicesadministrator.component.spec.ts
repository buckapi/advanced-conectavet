import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesadministratorComponent } from './servicesadministrator.component';

describe('ServicesadministratorComponent', () => {
  let component: ServicesadministratorComponent;
  let fixture: ComponentFixture<ServicesadministratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesadministratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesadministratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
