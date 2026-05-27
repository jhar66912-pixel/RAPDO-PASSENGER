# PHASE 2: Premium Flutter UI Generation

This document contains the production-ready Flutter code for the **RAHI Rider App Home Screen**. It implements the futuristic Black, Yellow, and Gold aesthetic with Glassmorphism, smooth animations, and AI recommendation widgets.

## Core RAHI Theme Definitions

```dart
// lib/core/theme/rahi_theme.dart
import 'package:flutter/material.dart';

class RahiColors {
  static const Color primaryBlack = Color(0xFF0F0F0F);
  static const Color luxuryYellow = Color(0xFFFFD000);
  static const Color accentGold = Color(0xFFF5B700);
  static const Color softWhite = Color(0xFFFAFAFA);
  static const Color deepGrey = Color(0xFF1E1E1E);
}

class RahiStyles {
  // Ultra-premium Glassmorphism Box Decoration
  static BoxDecoration glassDecoration = BoxDecoration(
    color: Colors.white.withOpacity(0.08),
    borderRadius: BorderRadius.circular(24),
    border: Border.all(color: Colors.white.withOpacity(0.15), width: 1.5),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.4),
        blurRadius: 30,
        spreadRadius: -5,
      )
    ],
  );
}
```

## Reusable Glassmorphism Widget

```dart
// lib/shared_widgets/glass_card.dart
import 'dart:ui';
import 'package:flutter/material.dart';
import '../core/theme/rahi_theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;

  const GlassCard({Key? key, required this.child, this.padding = const EdgeInsets.all(20), this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
          child: Container(
            padding: padding,
            decoration: RahiStyles.glassDecoration,
            child: child,
          ),
        ),
      ),
    );
  }
}
```

## RAHI Rider App Home Screen

```dart
// lib/features/ride_booking/screens/home_screen.dart
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../core/theme/rahi_theme.dart';
import '../../../shared_widgets/glass_card.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late GoogleMapController mapController;
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  final CameraPosition _initialPosition = const CameraPosition(
    target: LatLng(25.7796, 84.7499), // Example: Tier-2 City (Samastipur/Bihar)
    zoom: 14.5,
  );

  @override
  void initState() {
    super.initState();
    // Smooth Entry Animation
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200));
    _fadeAnimation = CurvedAnimation(parent: _animController, curve: Curves.easeOutExpo);
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RahiColors.primaryBlack,
      body: Stack(
        children: [
          // 1. Live Ambient Map Background
          GoogleMap(
            initialCameraPosition: _initialPosition,
            zoomControlsEnabled: false,
            myLocationEnabled: true,
            myLocationButtonEnabled: false,
            mapType: MapType.normal,
            // You would load a Dark-mode map style here via setMapStyle
            onMapCreated: (controller) => mapController = controller,
          ),

          // 2. Map Gradient Fade (Futuristic blending)
          Positioned.fill(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    RahiColors.primaryBlack.withOpacity(0.8),
                    Colors.transparent,
                    RahiColors.primaryBlack.withOpacity(0.95),
                  ],
                  stops: const [0.0, 0.4, 0.7],
                ),
              ),
            ),
          ),

          // 3. UI Content Overlay
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10),
                    
                    // Welcome & Profile Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              "Kahan jana hai?", 
                              style: TextStyle(color: Colors.white70, fontSize: 16, fontFamily: 'Hind'),
                            ),
                            Text(
                              "Good Morning, Rahul", 
                              style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, fontFamily: 'Poppins'),
                            ),
                          ],
                        ),
                        CircleAvatar(
                          backgroundColor: RahiColors.deepGrey,
                          radius: 24,
                          child: Icon(Icons.person, color: RahiColors.luxuryYellow),
                        )
                      ],
                    ),
                    const SizedBox(height: 24),

                    // AI Suggestion Widget (Gemini Integrated)
                    GlassCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          Icon(Icons.auto_awesome, color: RahiColors.accentGold, size: 24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: const [
                                Text("AI Suggestion", style: TextStyle(color: RahiColors.accentGold, fontSize: 12, fontWeight: FontWeight.bold)),
                                Text("Office ride available in 2 mins. Traffic is low.", style: TextStyle(color: Colors.white, fontSize: 14)),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios, color: Colors.white54, size: 16),
                        ],
                      ),
                    ),

                    const Spacer(),

                    // Core Service Cards (Bike & Parcel)
                    Row(
                      children: [
                        Expanded(
                          child: GlassCard(
                            onTap: () => print("Book Bike"),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: RahiColors.luxuryYellow.withOpacity(0.2), shape: BoxShape.circle),
                                  child: Icon(Icons.motorcycle, color: RahiColors.luxuryYellow, size: 32),
                                ),
                                const SizedBox(height: 16),
                                const Text("Bike Ride", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Poppins')),
                                const Text("Affordable & Fast", style: TextStyle(color: Colors.white54, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: GlassCard(
                            onTap: () => print("Send Parcel"),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(color: Colors.blueAccent.withOpacity(0.2), shape: BoxShape.circle),
                                  child: Icon(Icons.local_shipping, color: Colors.lightBlueAccent, size: 32),
                                ),
                                const SizedBox(height: 16),
                                const Text("Send Parcel", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'Poppins')),
                                const Text("Instant delivery", style: TextStyle(color: Colors.white54, fontSize: 12)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Voice Search Floating Bar (Hindi Native)
                    GlassCard(
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                      child: Row(
                        children: [
                          Icon(Icons.mic, color: RahiColors.luxuryYellow, size: 28),
                          const SizedBox(width: 16),
                          const Expanded(
                            child: Text(
                              "Tap to speak... 'Station jana hai'", 
                              style: TextStyle(color: Colors.white54, fontSize: 16, fontStyle: FontStyle.italic),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(color: RahiColors.luxuryYellow, borderRadius: BorderRadius.circular(30)),
                            child: const Text("Go", style: TextStyle(color: RahiColors.primaryBlack, fontWeight: FontWeight.bold)),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 30), // Padding for bottom navbar
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
```

## Added Dependencies (`pubspec.yaml`)
To support this design, you'll need standard visual and mapping dependencies:
```yaml
dependencies:
  flutter:
    sdk: flutter
  google_maps_flutter: ^2.5.0
  flutter_animate: ^4.2.0    # Optional: For easier micro-animations
  google_fonts: ^6.1.0       # For Poppins & Hind fonts
```
