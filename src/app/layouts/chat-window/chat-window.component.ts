import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LlmStoreService } from '../../services/llm-store.service';
import { Workspace, Thread, Message } from '../../models/llm.models';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  imports: [CommonModule,
    FormsModule 
  ]
})
export class ChatWindowComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;
  userInput: string = '';

  showPromptMenu = false;
  showUploadPopup: boolean = false;
  searchQuery: string = '';
  // This will hold the search results from the API.
  // Each object contains title and document_number.
  searchResults: Array<{ title: string; document_number: string }> = [];
  // Selected context from search results.
  selectedContext: { title: string; document_number: string } | null = null;
  

  // Predefined prompts
  predefinedPrompts: string[] = [
    'Hello, how are you?',
    'Tell me a joke',
    'What is the weather like today?',
    'Summarize this conversation',
    'What are the latest news headlines?',
  ];


  constructor(public store: LlmStoreService, private http: HttpClient) {}

  ngOnInit(): void {
    // Initialize the default workspace and thread on app startup.
    this.store.initializeDefaultWorkspace();
  }

  get selectedWorkspace(): Workspace | null {
    if (!this.store.selectedWorkspaceId) return null;
    return this.store.workspaces.find(w => w.id === this.store.selectedWorkspaceId) || null;
  }

  get selectedThread(): Thread | null {
    if (!this.selectedWorkspace || !this.store.selectedThreadId) return null;
    return this.selectedWorkspace.threads.find(t => t.id === this.store.selectedThreadId) || null;
  }

  get messages(): Message[] {
    return this.selectedThread?.messages || [];
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      return;
    }
    const encodedQuery = encodeURIComponent(this.searchQuery.trim());
    const apiUrl = `https://www.federalregister.gov/api/v1/documents.json?fields[]=document_number&fields[]=title&per_page=20&conditions[term]=${encodedQuery}`;
    
    this.http.get<any>(apiUrl).subscribe({
      next: (response) => {
        // Map the results array to our expected format.
        if (response && response.results) {
          this.searchResults = response.results.map((result: any) => ({
            title: result.title,
            document_number: result.document_number
          }));
        }
      },
      error: (err) => {
        console.error('Search API error:', err);
      }
    });
  }

  selectSearchResult(result: { title: string; document_number: string }): void {
    this.selectedContext = result;
    this.showUploadPopup = false;
  }
   
  triggerFileUpload(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Set context with the file name only
      this.selectedContext = { title: file.name , document_number: '123'};
      // Optionally, you can clear the file input value so the same file can be reselected if needed.
      input.value = '';
    }
  }

  
  toggleUploadPopup(): void {
    this.showUploadPopup = !this.showUploadPopup;
    // Reset search when opening the popup
    if (this.showUploadPopup) {
      this.searchQuery = '';
      this.searchResults = [];
    }
  }
  onSendMessage() {
    if (!this.store.selectedWorkspaceId || !this.store.selectedThreadId) return;
    if (!this.userInput.trim()) return;

    this.store.addMessage(
      this.store.selectedWorkspaceId,
      this.store.selectedThreadId,
      this.userInput,
      'user'
    );
    // Mock AI response (replace with real API call as needed)
    this.store.addMessage(
      this.store.selectedWorkspaceId,
      this.store.selectedThreadId,
      'This is a mock AI response.',
      'assistant'
    );

    this.userInput = '';
  }

  /** Toggle the visibility of the prompt menu */
  togglePromptMenu(): void {
    this.showPromptMenu = !this.showPromptMenu;
    console.log('Toggle prompt menu:', this.showPromptMenu);
  }

  /** When a prompt is selected, send it as a user message */
  onPromptSelected(prompt: string): void {
    this.showPromptMenu = false;
    this.userInput = prompt;
    this.onSendMessage();
  }


  /** Copy the message content to clipboard */
  copyMessage(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Copied to clipboard!');
      // Optionally, add a toast or feedback for the user.
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }

  /** Handle thumbs-up action */
  thumbsUpMessage(traceId: string): void {
    console.log(`Thumbs up for message ${traceId}`);
    // TODO: Implement additional logic like updating ratings or informing the backend.
  }

  /** Handle thumbs-down action */
  thumbsDownMessage(traceId: string): void {
    console.log(`Thumbs down for message ${traceId}`);
    // TODO: Implement additional logic like updating ratings or informing the backend.
  }


  // onSendMessage() {
  //   // Guard: make sure there's a selected workspace/thread
  //   if (!this.store.selectedWorkspaceId || !this.store.selectedThreadId) return;
  //   // Guard: skip empty input
  //   if (!this.userInput.trim()) return;

  //   // Add user message
  //   this.store.addMessage(this.store.selectedWorkspaceId, this.store.selectedThreadId, this.userInput, 'user');

  //   // (Optional) Immediately add a mock AI reply
  //   // Real app might call an API to get actual LLM response
  //   this.store.addMessage(this.store.selectedWorkspaceId, this.store.selectedThreadId, 'This is a mock AI response.', 'assistant');

  //   // Clear the text area
  //   this.userInput = '';
  // }
}
