import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SemanticSearchComponent } from './layouts/semantic-search/semantic-search.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatTooltipModule,
    SemanticSearchComponent
  ]
})
export class AppComponent {
  searchQuery: string = '';
  minMatchScore: number = 0;
  searchResults: any[] = [];

  performSearch() {
    // Your search functionality here
    console.log('Searching for:', this.searchQuery, 'with minimum score:', this.minMatchScore);
    
    // This would typically call your service
    // this.semanticSearchService.search(this.searchQuery, this.minMatchScore)
    //   .subscribe(results => {
    //     this.searchResults = results;
    //   });
  }
}