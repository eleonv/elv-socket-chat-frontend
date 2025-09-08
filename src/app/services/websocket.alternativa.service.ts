import { Injectable, signal } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../models/chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketAlternativeService {
  private stompClient: Client | null = null;
  /*private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();*/
  messages = signal<ChatMessage[]>([]);
  connectionStatus = signal<boolean>(false);

  connect(username: string): void {
    this.stompClient = new Client({
      // Usando WebSocket nativo en lugar de SockJS
      brokerURL: 'ws://localhost:8080/ws',
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Conectado: ' + frame);
      this.connectionStatus.set(true);

      // Suscribirse a los mensajes del chat
      this.stompClient!.subscribe('/topic/public', (message) => {
        const chatMessage: ChatMessage = JSON.parse(message.body);
        this.messages.update(msgs => [...msgs, chatMessage]);
        /*const currentMessages = this.messagesSubject.value;
        this.messages.set([...currentMessages, chatMessage]);*/
      });

      // Enviar mensaje de unión al chat
      this.addUser(username);
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('Error de WebSocket:', error);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Error de STOMP: ' + frame.headers['message']);
      console.error('Detalles: ' + frame.body);
    };

    this.stompClient.onDisconnect = () => {
      console.log('Desconectado');
      this.connectionStatus.set(false);
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connectionStatus.set(false);
    }
  }

  sendMessage(message: ChatMessage): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message)
      });
    }
  }

  addUser(username: string): void {
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage: ChatMessage = {
        sender: username,
        type: 'JOIN' as any,
        content: ''
      };

      this.stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify(chatMessage)
      });
    }
  }

  clearMessages(): void {
    this.messages.set([]);
  }
}
