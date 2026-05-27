// RAHI Bihar Premium Mobility - Flutter Escalation system mapper
// Generates support tickets in Firestore when DeepSeek flags extreme user frustration tags

import 'dart:convert';
import 'package:http/http.dart' as http;

class SupportTicket {
  final String ticketId;
  final String userId;
  final String customerName;
  final String issueCategory;
  final String description;
  final String priority;

  SupportTicket({
    required this.ticketId,
    required this.userId,
    required this.customerName,
    required this.issueCategory,
    required this.description,
    required this.priority,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': ticketId,
      'customerId': userId,
      'customerName': customerName,
      'issue': issueCategory,
      'desc': description,
      'priority': priority,
      'status': 'open',
      'createdAt': DateTime.now().millisecondsSinceEpoch,
    };
  }
}

class SupportEscalation {
  final String _escalateEndpoint = 'https://ais-dev-ivuri2urjncg3kc4u6q2zp-733212771784.asia-southeast1.run.app/api/rahi-ai/ticket';

  Future<bool> createSupportTicket(SupportTicket ticket) async {
    try {
      final response = await http.post(
        Uri.parse(_escalateEndpoint),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(ticket.toJson()),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      }
      return false;
    } catch (_) {
      // Return false but proceed locally showing fallback help numbers
      return false;
    }
  }
}
