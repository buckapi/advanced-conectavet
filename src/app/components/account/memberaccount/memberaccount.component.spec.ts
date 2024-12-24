import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberaccountComponent } from './memberaccount.component';

describe('MemberaccountComponent', () => {
  let component: MemberaccountComponent;
  let fixture: ComponentFixture<MemberaccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberaccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberaccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
