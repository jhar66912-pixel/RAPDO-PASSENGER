package com.rapdo.app.repository

import com.rapdo.app.domain.Ride
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class RideRepository {
    
    fun getActiveRides(): Flow<List<Ride>> = flow {
        // Fetch from Firebase...
        emit(emptyList())
    }
}
