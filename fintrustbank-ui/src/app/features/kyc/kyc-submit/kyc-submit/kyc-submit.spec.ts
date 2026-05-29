import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycSubmit } from './kyc-submit';

describe('KycSubmit', () => {
  let component: KycSubmit;
  let fixture: ComponentFixture<KycSubmit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycSubmit],
    }).compileComponents();

    fixture = TestBed.createComponent(KycSubmit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
