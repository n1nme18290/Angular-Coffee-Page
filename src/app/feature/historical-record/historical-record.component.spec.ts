import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalRecordComponent } from './historical-record.component';

describe('HistoricalRecordComponent', () => {
  let component: HistoricalRecordComponent;
  let fixture: ComponentFixture<HistoricalRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricalRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricalRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
