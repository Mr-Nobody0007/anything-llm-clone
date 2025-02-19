import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LlmStoreService } from '../../services/llm-store.service';
import { Workspace } from '../../models/llm.models';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule]
})
export class SidebarComponent {
  constructor(public store: LlmStoreService) {}

  get workspaces(): Workspace[] {
    return this.store.workspaces;
  }

  onCreateWorkspace() {
    const newName = prompt('Enter new workspace name:', 'New Workspace');
    if (newName) {
      const ws = this.store.createWorkspace(newName);
      // Create a default thread
      const defaultThread = this.store.createThread(ws.id, 'default');
      // Set active in store
      this.store.setActiveWorkspaceThread(ws.id, defaultThread?.id ?? '');
    }
  }

  onCreateThread(workspaceId: string) {
    const newThreadName = prompt('Enter new thread name:', 'New Thread');
    if (newThreadName) {
      const th = this.store.createThread(workspaceId, newThreadName);
      // Set newly created thread as active
      if (th) {
        this.store.setActiveWorkspaceThread(workspaceId, th.id);
      }
    }
  }

  selectWorkspace(workspaceId: string) {
    const workspace = this.store.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return;
    // If workspace has any threads, pick the first. Otherwise none
    const firstThreadId = workspace.threads.length ? workspace.threads[0].id : null;
    this.store.setActiveWorkspaceThread(workspaceId, firstThreadId ?? '');
  }

  selectThread(threadId: string, workspaceId: string) {
    this.store.setActiveWorkspaceThread(workspaceId, threadId);
  }

  deleteWorkspace(workspaceId: string) {
    // Optional: Ask for user confirmation
    const confirmation = confirm('Are you sure you want to delete this workspace?');
    if (confirmation) {
      this.store.deleteWorkspace(workspaceId);
    }
  }
}


