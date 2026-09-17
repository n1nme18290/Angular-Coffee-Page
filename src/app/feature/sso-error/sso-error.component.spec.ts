import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoErrorComponent } from './sso-error.component';

describe('SsoErrorComponent', () => {
  let component: SsoErrorComponent;
  let fixture: ComponentFixture<SsoErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SsoErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
