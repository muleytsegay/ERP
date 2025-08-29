import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidabarComponent } from './sidabar.component';

describe('SidabarComponent', () => {
  let component: SidabarComponent;
  let fixture: ComponentFixture<SidabarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidabarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidabarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
