package com.rapdo.app.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class HomeViewModel : ViewModel() {
    
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    fun updateLocation(location: String) {
        _uiState.value = _uiState.value.copy(currentLocation = location)
    }
}

data class HomeUiState(
    val currentLocation: String = "Fetching...",
    val isLoading: Boolean = false
)
