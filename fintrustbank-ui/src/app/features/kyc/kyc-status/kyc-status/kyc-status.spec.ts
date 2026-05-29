import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycStatus } from './kyc-status';

describe('KycStatus', () => {
  let component: KycStatus;
  let fixture: ComponentFixture<KycStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(KycStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
