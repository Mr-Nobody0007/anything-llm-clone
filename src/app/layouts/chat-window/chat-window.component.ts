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
  showPdfUrlPopup: boolean = false;
  pdfUrl: string = '';
  isPdfUrlValid: boolean = false;
  isValidatingUrl: boolean = false;

  searchQuery: string = '';
  // This will hold the search results from the API.
  // Each object contains title and document_number.
  searchResults: Array<{ title: string; document_number: string }> = [];
  // Selected context from search results.
  selectedContext: { title: string; document_number: string, sourceIcon: string } | null = null;
  
  // Track if context has been fixed for the current workspace
  contextIsFixed: boolean = false;

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
    const workspace = this.store.workspaces.find(w => w.id === this.store.selectedWorkspaceId) || null;
    
    // Check if this workspace already has a document attached
    if (workspace && workspace.document) {
      this.contextIsFixed = true;
    } else {
      this.contextIsFixed = false;
    }
    
    return workspace;
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

  togglePdfUrlPopup(): void {
    // Only allow toggling if context is not fixed
    if (this.contextIsFixed) return;
    
    this.showPdfUrlPopup = !this.showPdfUrlPopup;
    if (this.showPdfUrlPopup) {
      this.pdfUrl = '';
      this.isPdfUrlValid = false;
      this.isValidatingUrl = false;
    }
  }

  checkPdfUrl(): void {
    // Reset validation state
    this.isPdfUrlValid = false;
    
    if (!this.pdfUrl.trim()) {
      return;
    }
    
    this.isValidatingUrl = true;
    
    // Less strict validation - primarily check if it ends with .pdf
    const isPdfExtension = this.pdfUrl.toLowerCase().endsWith('.pdf');
    
    // Special case for government domains - less strict validation
    const isGovDomain = this.pdfUrl.includes('.gov') || this.pdfUrl.includes('.mil');
    
    // Consider it valid if it has a PDF extension, especially for government domains
    this.isPdfUrlValid = isPdfExtension;
    this.isValidatingUrl = false;
  }

  downloadPdf(): void {
    if (!this.pdfUrl.trim() || !this.isPdfUrlValid) {
      return;
    }
    
    // Option 1: Use the Fetch API to get the file as a blob
    fetch(this.pdfUrl)
      .then(response => response.blob())
      .then(blob => {
        // Create a blob URL for the file
        const blobUrl = URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = this.pdfUrl.split('/').pop() || 'document.pdf';
        
        // Append to body, click, and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Release the blob URL
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 100);
      })
      .catch(error => {
        console.error('Error downloading PDF:', error);
        
        // Fallback method if fetch fails - might open in browser tab
        window.open(this.pdfUrl, '_blank');
      });
  }

  onSubmitPdfUrl(): void {
    if (!this.pdfUrl.trim() || !this.isPdfUrlValid || this.contextIsFixed) {
      return;
    }
    
    const segments = this.pdfUrl.trim().split('/');
    const filename = segments.pop() || ''; // Get the last segment (e.g. "x.pdf")
    // Set the context locally with PDF icon source
    this.selectedContext = { 
      title: filename, 
      document_number: filename,
      sourceIcon: 'assets/pdf-link.ico'
    };
    this.showPdfUrlPopup = false;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSendMessage();
    }
  }

  performSearch(): void {
    if (!this.searchQuery.trim() || this.contextIsFixed) {
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
    if (this.contextIsFixed) return;
    
    this.selectedContext = {
      ...result,
      sourceIcon: 'assets/upload.ico'
    };
    this.showUploadPopup = false;
  }
   
  triggerFileUpload(): void {
    if (this.contextIsFixed) return;
    
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  handleFileInput(event: Event): void {
    if (this.contextIsFixed) return;
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Set context with the file name and file icon
      this.selectedContext = { 
        title: file.name, 
        document_number: '123',
        sourceIcon: 'assets/file-upload.ico'
      };
      // Optionally, you can clear the file input value so the same file can be reselected if needed.
      input.value = '';
    }
  }

  
  toggleUploadPopup(): void {
    if (this.contextIsFixed) return;
    
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

    // If there's a selected context, update the workspace with document info
    if (this.selectedContext) {
      // Update the workspace with the document info
      this.store.attachDocumentToWorkspace(
        this.store.selectedWorkspaceId, 
        this.selectedContext.title,
        this.selectedContext.document_number,
        this.selectedContext.sourceIcon
      );
      
      // Set contextIsFixed to true to disable context changing controls
      this.contextIsFixed = true;
      
      // Remove the pinned context display since it's now fixed
      this.selectedContext = null;
    }

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
}