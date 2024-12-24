import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackheaderComponent } from './backheader.component';

describe('BackheaderComponent', () => {
  let component: BackheaderComponent;
  let fixture: ComponentFixture<BackheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackheaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
