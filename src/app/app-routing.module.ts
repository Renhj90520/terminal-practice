import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommandShellComponent } from './command-shell/command-shell.component';
import { LogShellComponent } from './log-shell/log-shell.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'log',
    pathMatch: 'full'
  },
  {
    path: 'command',
    component: CommandShellComponent
  },
  {
    path: 'log',
    component: LogShellComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
