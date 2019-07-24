import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogShellComponent } from './log-shell.component';

describe('LogShellComponent', () => {
  let component: LogShellComponent;
  let fixture: ComponentFixture<LogShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
