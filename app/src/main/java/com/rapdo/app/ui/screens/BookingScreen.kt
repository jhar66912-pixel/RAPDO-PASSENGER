package com.rapdo.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.rapdo.app.ui.components.DriverDetailsCard

enum class RideState {
    IDLE,
    SEARCHING,
    ACCEPTED
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookingScreen() {
    var rideState by remember { mutableStateOf(RideState.IDLE) }
    var pickup by remember { mutableStateOf("") }
    var destination by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Book a Ride") })
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).padding(16.dp)) {
            OutlinedTextField(
                value = pickup,
                onValueChange = { pickup = it },
                label = { Text("Pickup Location") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedTextField(
                value = destination,
                onValueChange = { destination = it },
                label = { Text("Drop Location") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(24.dp))
            
            if (rideState == RideState.IDLE || rideState == RideState.SEARCHING) {
                Button(
                    onClick = {
                        coroutineScope.launch {
                            rideState = RideState.SEARCHING
                            // Mocking network delay and captain matching
                            delay(2000L)
                            rideState = RideState.ACCEPTED
                        }
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                    enabled = rideState != RideState.SEARCHING && pickup.isNotEmpty() && destination.isNotEmpty()
                ) {
                    if (rideState == RideState.SEARCHING) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                            strokeWidth = 2.dp
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text("Looking for Captains...")
                    } else {
                        Text("Find Captains")
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            if (rideState == RideState.ACCEPTED) {
                val context = androidx.compose.ui.platform.LocalContext.current
                DriverDetailsCard(
                    driverName = "Rahul Sharma",
                    vehicleModel = "TVS Jupiter",
                    vehicleNumber = "KA 01 AB 1234",
                    rating = "4.8",
                    driverPhotoUrl = "https://i.pravatar.cc/150?img=11",
                    onCallClick = {
                        val intent = android.content.Intent(android.content.Intent.ACTION_DIAL).apply {
                            data = android.net.Uri.parse("tel:+919876543210")
                        }
                        context.startActivity(intent)
                    },
                    onMessageClick = { /* TODO */ },
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                Button(
                    onClick = { rideState = RideState.IDLE },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("Cancel Ride")
                }
            }
        }
    }
}
