import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddserviceComponent } from './addservice.component';

describe('AddserviceComponent', () => {
  let component: AddserviceComponent;
  let fixture: ComponentFixture<AddserviceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddserviceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddserviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
