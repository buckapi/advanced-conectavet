import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReeldetailComponent } from './reeldetail.component';

describe('ReeldetailComponent', () => {
  let component: ReeldetailComponent;
  let fixture: ComponentFixture<ReeldetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReeldetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReeldetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
