import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LlmStoreService } from '../../services/llm-store.service';
import { Workspace, Thread, Message } from '../../models/llm.models';

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
  userInput: string = '';

  showPromptMenu = false;

  // Predefined prompts
  predefinedPrompts: string[] = [
    'Hello, how are you?',
    'Tell me a joke',
    'What is the weather like today?',
    'Summarize this conversation',
    'What are the latest news headlines?',
  ];


  constructor(public store: LlmStoreService) {}

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
