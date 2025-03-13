import { Component } from '@angular/core';
 import { SidebarComponent } from './layouts/sidebar/sidebar.component';
 import { ChatWindowComponent } from './layouts/chat-window/chat-window.component';
 import { CommonModule } from '@angular/common';
 import { HttpClientModule } from '@angular/common/http';
 import { RegulationSidebarComponent } from './layouts/regulation-sidebar/regulation-sidebar.component';

@Component({
  standalone: true,
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,         // so you can use *ngIf, *ngFor, etc.
     SidebarComponent,
     ChatWindowComponent,
     RegulationSidebarComponent,
     HttpClientModule
  ]
})
export class AppComponent {
  

  
}