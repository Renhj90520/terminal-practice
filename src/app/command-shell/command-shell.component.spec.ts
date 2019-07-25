import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandShellComponent } from './command-shell.component';

describe('CommandShellComponent', () => {
  let component: CommandShellComponent;
  let fixture: ComponentFixture<CommandShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommandShellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommandShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
