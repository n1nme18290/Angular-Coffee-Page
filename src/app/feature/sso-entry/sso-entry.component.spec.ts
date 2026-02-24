import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SsoEntryComponent } from './sso-entry.component';

describe('SsoEntryComponent', () => {
  let component: SsoEntryComponent;
  let fixture: ComponentFixture<SsoEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsoEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SsoEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
