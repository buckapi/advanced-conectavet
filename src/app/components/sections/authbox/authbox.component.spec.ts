import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthboxComponent } from './authbox.component';

describe('AuthboxComponent', () => {
  let component: AuthboxComponent;
  let fixture: ComponentFixture<AuthboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
