import { Injectable } from '@angular/core';
import { Workspace, Thread, Message } from '../models/llm.models';

// A quick function to generate unique IDs for demonstration
function generateId(prefix: string = 'id'): string {
  return prefix + '_' + Math.random().toString(36).substr(2, 9);
}

@Injectable({
  providedIn: 'root'
})
export class LlmStoreService {
  workspaces: Workspace[] = [];
  selectedWorkspaceId: string | null = null;
  selectedThreadId: string | null = null;

  setActiveWorkspaceThread(workspaceId: string, threadId: string) {
    this.selectedWorkspaceId = workspaceId;
    this.selectedThreadId = threadId;
  }

  constructor() {
    // Optionally seed an example workspace for testing:
    const defaultWs = this.createWorkspace('Default Workspace');
    this.createThread(defaultWs.id, 'default');
  }

  createWorkspace(name: string): Workspace {
    const newWorkspace: Workspace = {
      id: generateId('ws'),
      name,
      threads: []
    };
    this.workspaces.push(newWorkspace);
    return newWorkspace;
  }

  createThread(workspaceId: string, threadName: string): Thread {
    const workspace = this.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    const newThread: Thread = {
      id: generateId('th'),
      name: threadName,
      messages: []
    };
    workspace.threads.push(newThread);
    return newThread;
  }

  initializeDefaultWorkspace(): void {
    // Check if any workspace exists; if not, create one.
    if (this.workspaces.length === 0) {
      const defaultWorkspace = this.createWorkspace('Default Workspace 2');
      const defaultThread = this.createThread(defaultWorkspace.id, 'default');
      this.setActiveWorkspaceThread(defaultWorkspace.id, defaultThread.id);
      return;
    }

    // Look for a workspace named "default workspace 2" (case-insensitive)
    let defaultWs = this.workspaces.find(ws => ws.name.toLowerCase() === 'default workspace 2');
    if (!defaultWs) {
      defaultWs = this.createWorkspace('default workspace 2');
    }

    // Look for a thread named "default" in that workspace
    let defaultThread = defaultWs.threads.find(th => th.name.toLowerCase() === 'default');
    if (!defaultThread) {
      defaultThread = this.createThread(defaultWs.id, 'default');
    }

    // Set this workspace and thread as active
    this.setActiveWorkspaceThread(defaultWs.id, defaultThread.id);
  }

  generateUniqueId(): string {
    // A simple unique ID generator. Replace with your preferred method.
    return Math.random().toString(36).substr(2, 9);
  }

  // Add a document to a workspace
  attachDocumentToWorkspace(
    workspaceId: string, 
    title: string, 
    document_number: string,
    sourceIcon: string
  ): void {
    const workspace = this.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return;

    workspace.document = {
      title,
      document_number,
      sourceIcon
    };
  }

  addMessage(workspaceId: string, threadId: string, content: string, role: 'user' | 'assistant'): Message | undefined {
    const workspace = this.workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return undefined;

    const thread = workspace.threads.find((t) => t.id === threadId);
    if (!thread) return undefined;

    const newMessage: Message = {
      id: generateId('msg'),
      traceId: generateId('trace'),
      content,
      role
    };
    thread.messages.push(newMessage);
    return newMessage;
  }

  deleteWorkspace(workspaceId: string): void {
    // 1. Find the index of the workspace to delete
    const index = this.workspaces.findIndex((w) => w.id === workspaceId);
    if (index === -1) {
      // Workspace not found; no action needed
      return;
    }

    // 2. Remove the workspace from the array
    this.workspaces.splice(index, 1);

    // 3. If the deleted workspace was the currently selected workspace, reset selection
    if (this.selectedWorkspaceId === workspaceId) {
      // If there are still workspaces left, select the first one and its first thread (if any)
      if (this.workspaces.length > 0) {
        const firstWorkspace = this.workspaces[0];
        this.selectedWorkspaceId = firstWorkspace.id;
        this.selectedThreadId = firstWorkspace.threads.length
          ? firstWorkspace.threads[0].id
          : null;
      } else {
        // No workspaces left
        this.selectedWorkspaceId = null;
        this.selectedThreadId = null;
      }
    }
  }
}