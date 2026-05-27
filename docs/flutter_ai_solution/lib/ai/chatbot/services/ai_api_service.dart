// RAHI Bihar Premium Mobility Network - secure backend proxy API Client
// Secure connection wrapper avoiding client-side API key exposures

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';

class AiApiService {
  final String _backendUrl;
  
  AiApiService({String? overrideUrl}) 
      : _backendUrl = overrideUrl ?? 'https://ais-dev-ivuri2urjncg3kc4u6q2zp-733212771784.asia-southeast1.run.app/api/rahi-ai/chat';

  // Sourced client request with built-in retry-mechanism & timeout parameters
  Future<String> sendChatMessage({
    required List<ChatMessage> chatHistory,
    required String prompt,
    String? userSessionId,
    Map<String, dynamic>? activeBookingContext,
  }) async {
    final Map<String, String> headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Pack sliding memory elements (up to last 10 messages)
    final List<Map<String, String>> messagesPayload = [];
    
    // Add history in standard Open-AI role structures
    for (var message in chatHistory) {
      if (message.status == MessageStatus.completed) {
        messagesPayload.add({
          'role': message.role == MessageRole.user ? 'user' : 'assistant',
          'content': message.text,
        });
      }
    }

    // Append current prompt
    messagesPayload.add({
      'role': 'user',
      'content': prompt,
    });

    final Map<String, dynamic> body = {
      'sessionId': userSessionId ?? 'session_${DateTime.now().millisecondsSinceEpoch}',
      'messages': messagesPayload,
      'metadata': {
        'platform': 'flutter_android',
        'activeBooking': activeBookingContext,
        'district': 'Samastipur_HQ',
      }
    };

    int maximumRetries = 2;
    int attempt = 0;

    while (attempt <= maximumRetries) {
      try {
        final response = await http.post(
          Uri.parse(_backendUrl),
          headers: headers,
          body: jsonEncode(body),
        ).timeout(const Duration(seconds: 12));

        if (response.statusCode == 200) {
          final decoded = jsonDecode(response.body);
          if (decoded['choices'] != null && decoded['choices'].isNotEmpty) {
            return decoded['choices'][0]['message']['content'] as String;
          } else if (decoded['reply'] != null) {
            return decoded['reply'] as String;
          }
          throw const HttpException('Malformed JSON API structure returned from backend');
        } else {
          throw HttpException('Backend server responded with error status ${response.statusCode}');
        }
      } on SocketException {
        // Fallback or retry on weak cellular network typical inside local Bihar towns
        attempt++;
        if (attempt > maximumRetries) {
          return '👋 Network lag lag raha hai. Aapka internet slow hai, par RAHI offline support line chal rahi hai. Dial 8252988672 dial karein.';
        }
        await Future.delayed(Duration(seconds: 2 * attempt));
      } catch (error) {
        attempt++;
        if (attempt > maximumRetries) {
          return '👋 Namaste. Hamari AI systems me connectivity issue hai. Par chinta mat karein, RAHI Headquarters pe log ready hain. Call karein ya WhatsApp pe automatic booking ke liye niche link tap karein.';
        }
        await Future.delayed(Duration(seconds: 1 * attempt));
      }
    }

    return 'Namaste. Kuch error ho raha hai, please retry karein.';
  }
}
