import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { SemanticSearchService } from './semantic-search.service';
interface SearchResult {
title: string; // Using 'index' from API as title
description: string; // Using 'text' from API as description
matchScore: number; // Using 'score' from API
}
interface ApiResponse {
StatusSummary: {
Code: string;
Type: string;
Message: string;
}
traceId: string;
Summary: { index: string; text: string; score: number }[];

}

@Component({
  selector: 'app-semantic-search',
  standalone: true,
  imports:[
  CommonModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatListModule,
  FormsModule,
  MatTooltipModule,
  MatFormFieldModule
  ],
  templateUrl: './semantic-search.component.html',
  styleUrls: [ './semantic-search.component.scss'],
  })
  export class SemanticSearchComponent implements OnInit {
  searchQuery: string = '';
  minMatchScore: number = 0;
  searchResults: SearchResult[] = [];
  constructor(private semanticSearchService: SemanticSearchService, private cdr:ChangeDetectorRef) {}
ngOnInit(): void {}

performSearch(): void {
  if (!this.searchQuery) {
  this.searchResults = []; // Clear results if no query
  return;
  }

this.semanticSearchService.getSummary(this.searchQuery).subscribe({
next: (response: ApiResponse) => {
  // Map the Summary array to SearchResult format
  this.searchResults = response.Summary.map(item => ({
    title: item.index || 'No title', // Use 'index' as title
    description: item.text || 'No description', // Use 'text' as description 
    matchScore: item.score || 0, // Use 'score' as match score
  })).filter(result => result.matchScore >= this.minMatchScore);
this.cdr.detectChanges();
},
error: (error) => {
console.error('Error fetching search results:', error);
this.searchResults = []; // Clear results on error
this.cdr.detectChanges();
},
});
}
}
