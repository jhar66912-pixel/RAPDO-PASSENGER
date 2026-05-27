// RAHI Bihar Premium Mobility Network - State Notifier Provider
// High-grade Flutter State-Management utilizing Riverpod-like paradigms

import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/chat_message.dart';
import '../services/ai_api_service.dart';

class ChatState {
  final List<ChatMessage> messages;
  final bool isLoading;
  final String sessionId;
  final String? activeErrorCode;

  ChatState({
    required this.messages,
    required this.isLoading,
    required this.sessionId,
    this.activeErrorCode,
  });

  ChatState.initial()
      : messages = [
          ChatMessage(
            id: 'system_welcome',
            text: 'Pranaam! RAHI Help AI me aapka swagat hai. 🙏\n\nMain aapki ride coordinates, Bihar routes ticket rates, parcel delivery status ya payment issues me help kar sakti hoon.\n\nAsk me anything in Hinglish or simple Hindi!',
            role: MessageRole.assistant,
            timestamp: DateTime.now(),
          )
        ],
        isLoading = false,
        sessionId = 'session_${DateTime.now().millisecondsSinceEpoch}',
        activeErrorCode = null;

  ChatState copyWith({
    List<ChatMessage>? messages,
    bool? isLoading,
    String? sessionId,
    String? activeErrorCode,
  }) {
    return ChatState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      sessionId: sessionId ?? this.sessionId,
      activeErrorCode: activeErrorCode ?? this.activeErrorCode,
    );
  }
}

class ChatProviderNotifier extends ChangeNotifier {
  final AiApiService _apiService = AiApiService();
  late ChatState _state;

  ChatProviderNotifier() {
    _state = ChatState.initial();
  }

  ChatState get state => _state;

  // Sends message to local ledger, calls proxy, gets result sliding system
  Future<void> submitUserQuery(String text, {Map<String, dynamic>? bookingContext}) async {
    if (text.trim().isEmpty) return;

    final userMsg = ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      text: text,
      role: MessageRole.user,
      timestamp: DateTime.now(),
      status: MessageStatus.sent,
    );

    // Append users text, trigger typing indicators
    final List<ChatMessage> updatedMessages = [..._state.messages, userMsg];
    _state = _state.copyWith(
      messages: updatedMessages,
      isLoading: true,
    );
    notifyListeners();

    // Call secure proxy endpoint holding our DeepSeek API key
    try {
      final String assistantReply = await _apiService.sendChatMessage(
        chatHistory: _state.messages.sublist(
          _state.messages.length > 8 ? _state.messages.length - 8 : 0,
        ), // Sliding window memory constraint
        prompt: text,
        userSessionId: _state.sessionId,
        activeBookingContext: bookingContext,
      );

      final assistantMsg = ChatMessage(
        id: 'reply_${DateTime.now().millisecondsSinceEpoch}',
        text: assistantReply,
        role: MessageRole.assistant,
        timestamp: DateTime.now(),
        status: MessageStatus.completed,
      );

      _state = _state.copyWith(
        messages: [..._state.messages, assistantMsg],
        isLoading: false,
      );
    } catch (e) {
      final assistantMsg = ChatMessage(
        id: 'reply_err_${DateTime.now().millisecondsSinceEpoch}',
        text: 'Maaf kijiyega, server network slow ho gaya hai. Aap direct call karke booking confirm kar sakte hain: +91 8252988672.',
        role: MessageRole.assistant,
        timestamp: DateTime.now(),
        status: MessageStatus.failed,
      );

      _state = _state.copyWith(
        messages: [..._state.messages, assistantMsg],
        isLoading: false,
        activeErrorCode: e.toString(),
      );
    }

    notifyListeners();
  }

  // Clear memory cache / Reset session
  void resetConversation() {
    _state = ChatState.initial();
    notifyListeners();
  }
}
