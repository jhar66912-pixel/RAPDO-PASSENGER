// RAHI Bihar Premium Mobility Assistant - RAHI Help AI Screen
// Premium Matte Black & Luxury Yellow UI configured for ultra-responsive rendering on Android and iOS devices.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/chat_message.dart';
import '../providers/chat_provider.dart';
import '../widgets/typing_indicator.dart';

class AiChatScreen extends StatefulWidget {
  final Map<String, dynamic>? preloadedBookingContext;

  const AiChatScreen({
    Key? key,
    this.preloadedBookingContext,
  }) : super(key: key);

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ChatProviderNotifier _chatProvider = ChatProviderNotifier();

  final List<String> _quickPromptChips = [
    'Bhai, ride kitna time me aayega?',
    'Patna se Hajipur ka price list kya hai?',
    'Parcel delivery delay ho raha hai',
    'Driver call nahi utha raha hai',
  ];

  @override
  void initState() {
    super.initState();
    _chatProvider.addListener(_onStateChanged);
  }

  void _onStateChanged() {
    if (mounted) {
      setState(() {});
      _scrollToBottom();
    }
  }

  @override
  void dispose() {
    _chatProvider.removeListener(_onStateChanged);
    _chatProvider.dispose();
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    // Staggered scroll to avoid frames dropping on lower-end devices
    Future.delayed(const Duration(milliseconds: 150), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _sendMessage() {
    final text = _inputController.text.trim();
    if (text.isEmpty) return;

    _inputController.clear();
    _chatProvider.submitUserQuery(
      text,
      bookingContext: widget.preloadedBookingContext,
    );
  }

  Future<void> _makeEmergencySosCall() async {
    const String sosUri = 'tel:+918252988672';
    if (await canLaunchUrl(Uri.parse(sosUri))) {
      await launchUrl(Uri.parse(sosUri));
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = _chatProvider.state;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A), // Premium Matte Black
      appBar: AppBar(
        backgroundColor: const Color(0xFF121212).withOpacity(0.85),
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        centerTitle: false,
        title: Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                color: Color(0xFFFACC15), // Glowing Luxury Yellow dot
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Color(0xFFFACC15),
                    brightness: Brightness.dark,
                    blurRadius: 8,
                    spreadRadius: 2,
                  )
                ],
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'RAHI Help AI',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                    fontFamily: 'Inter',
                  ),
                ),
                Text(
                  'Bihar Express Assistant • Active',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.4),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.4,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => _chatProvider.resetConversation(),
            icon: const Icon(Icons.refresh, color: Colors.white60, size: 20),
            tooltip: 'Clear Memory',
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: TextButton.icon(
              onPressed: _makeEmergencySosCall,
              icon: const Icon(Icons.phone_enabled, color: Colors.black, size: 14),
              label: const Text(
                'SOS',
                style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.black),
              ),
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFFFACC15),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          )
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Conversational Stream Area
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.all(16),
                itemCount: state.messages.length + (state.isLoading ? 1 : 0),
                itemBuilder: (context, index) {
                  // Typing indicator case
                  if (index == state.messages.length) {
                    return _buildTypingIndicatorBubble();
                  }

                  final message = state.messages[index];
                  return _buildMessageBubble(message);
                },
              ),
            ),

            // Context Prompt Suggestions Tracker
            if (state.messages.length <= 1) _buildQuickChipsList(),

            // Chat Input Controller
            _buildInputRow(),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickChipsList() {
    return Container(
      height: 48,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: _quickPromptChips.length,
        itemBuilder: (context, index) {
          final prompt = _quickPromptChips[index];
          return Container(
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: ActionChip(
              backgroundColor: const Color(0xFF1E1E1E),
              side: BorderSide(color: Colors.white.withOpacity(0.08)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              elevation: 1,
              label: Text(
                prompt,
                style: const TextStyle(
                  color: Colors.white80,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              onPressed: () {
                _inputController.text = prompt;
                _sendMessage();
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage message) {
    final isUser = message.role == MessageRole.user;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isUser ? const Color(0xFF1A1A1A) : const Color(0xFF121212),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(20),
            topRight: const Radius.circular(20),
            bottomLeft: isUser ? const Radius.circular(20) : Radius.zero,
            bottomRight: isUser ? Radius.zero : const Radius.circular(20),
          ),
          border: Border.all(
            color: isUser ? const Color(0xFFFACC15).withOpacity(0.12) : Colors.white.withOpacity(0.04),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isUser ? Colors.white : Colors.white.withOpacity(0.9),
                fontSize: 13.5,
                height: 1.4,
                fontFamily: 'Inter',
              ),
            ),
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.bottomRight,
              child: Text(
                '${message.timestamp.hour.toString().padLeft(2, '0')}:${message.timestamp.minute.toString().padLeft(2, '0')}',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.25),
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicatorBubble() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF121212),
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.zero,
            bottomRight: Radius.circular(20),
          ),
          border: Border.all(color: Colors.white.withOpacity(0.03)),
        ),
        child: const TypingIndicator(),
      ),
    );
  }

  Widget _buildInputRow() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF101010),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.05))),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF1E1E1E),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _inputController,
                maxLines: null,
                style: const TextStyle(color: Colors.white, fontSize: 13.5),
                decoration: InputDecoration(
                  hintText: 'Bhai se pucho...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 13.5),
                  border: InputBorder.none,
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              width: 48,
              height: 48,
              decoration: const BoxDecoration(
                color: Color(0xFFFACC15), // Luxury Yellow base
                shape: BoxShape.circle,
                shadows: [
                  BoxShadow(
                    color: Color(0xFFFACC15),
                    blurRadius: 10,
                    spreadRadius: -1,
                  )
                ],
              ),
              child: const Icon(Icons.send_rounded, color: Colors.black, size: 20),
            ),
          )
        ],
      ),
    );
  }
}
