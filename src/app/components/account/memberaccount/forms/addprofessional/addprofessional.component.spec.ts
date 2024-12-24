import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddprofessionalComponent } from './addprofessional.component';

describe('AddprofessionalComponent', () => {
  let component: AddprofessionalComponent;
  let fixture: ComponentFixture<AddprofessionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddprofessionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddprofessionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
