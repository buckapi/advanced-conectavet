import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveservicesComponent } from './activeservices.component';

describe('ActiveservicesComponent', () => {
  let component: ActiveservicesComponent;
  let fixture: ComponentFixture<ActiveservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveservicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
