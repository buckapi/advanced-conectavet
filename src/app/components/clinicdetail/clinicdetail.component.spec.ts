import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicdetailComponent } from './clinicdetail.component';

describe('ClinicdetailComponent', () => {
  let component: ClinicdetailComponent;
  let fixture: ComponentFixture<ClinicdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicdetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
