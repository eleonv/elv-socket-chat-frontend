import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatMessage, MessageType } from '../../models/chat-message.model';
import { WebSocketAlternativeService } from '../../services/websocket.alternativa.service';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  username: string = '';
  messageContent: string = '';
  messages: ChatMessage[] = [];
  isConnected: boolean = false;

  private messagesSubscription!: Subscription;
  private connectionSubscription!: Subscription;

  constructor(
    //private webSocketService: WebSocketService,
    private webSocketService: WebSocketAlternativeService
  ) { }

  ngOnInit(): void {
    this.messagesSubscription = this.webSocketService.messages$.subscribe(
      messages => this.messages = messages
    );

    this.connectionSubscription = this.webSocketService.connectionStatus$.subscribe(
      status => this.isConnected = status
    );
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  connect(): void {
    if (this.username.trim()) {
      this.webSocketService.clearMessages();
      this.webSocketService.connect(this.username.trim());
    }
  }

  disconnect(): void {
    this.webSocketService.disconnect();
    this.username = '';
  }

  sendMessage(): void {
    if (this.messageContent.trim()) {
      const chatMessage: ChatMessage = {
        sender: this.username,
        content: this.messageContent.trim(),
        type: MessageType.CHAT
      };

      this.webSocketService.sendMessage(chatMessage);
      this.messageContent = '';
    }
  }

  getMessageClass(message: ChatMessage): string {
    if (message.type === MessageType.JOIN || message.type === MessageType.LEAVE) {
      return 'message system';
    }
    return message.sender === this.username ? 'message own' : 'message other';
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
