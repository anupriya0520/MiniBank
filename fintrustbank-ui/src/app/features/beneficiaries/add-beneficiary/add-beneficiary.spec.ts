import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddBeneficiary } from './add-beneficiary';

describe('AddBeneficiary', () => {
  let component: AddBeneficiary;
  let fixture: ComponentFixture<AddBeneficiary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBeneficiary],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBeneficiary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
