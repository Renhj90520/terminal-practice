import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LogShellComponent } from './log-shell/log-shell.component';
import { CommandShellComponent } from './command-shell/command-shell.component';

@NgModule({
  declarations: [
    AppComponent,
    LogShellComponent,
    CommandShellComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
