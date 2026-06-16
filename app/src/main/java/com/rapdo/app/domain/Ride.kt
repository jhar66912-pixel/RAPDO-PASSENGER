package com.rapdo.app.domain

data class Ride(
    val id: String,
    val origin: String,
    val destination: String,
    val status: String,
    val captainId: String?
)
