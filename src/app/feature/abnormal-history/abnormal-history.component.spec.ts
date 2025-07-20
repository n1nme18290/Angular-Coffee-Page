import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbnormalHistoryComponent } from './abnormal-history.component';

describe('AbnormalHistoryComponent', () => {
  let component: AbnormalHistoryComponent;
  let fixture: ComponentFixture<AbnormalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbnormalHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbnormalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
