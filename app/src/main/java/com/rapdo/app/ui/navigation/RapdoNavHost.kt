package com.rapdo.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.rapdo.app.ui.screens.LoginScreen
import com.rapdo.app.ui.screens.HomeScreen
import com.rapdo.app.ui.screens.BookingScreen
import com.rapdo.app.ui.screens.WalletScreen

@Composable
fun RapdoNavHost(
    navController: NavHostController = rememberNavController(),
    startDestination: String = "login"
) {
    NavHost(navController = navController, startDestination = startDestination) {
        composable("login") {
            LoginScreen(
                onNavigateToHome = {
                    navController.navigate("home") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        composable("home") {
            HomeScreen(
                onNavigateToBooking = { navController.navigate("booking") },
                onNavigateToWallet = { navController.navigate("wallet") }
            )
        }
        composable("booking") {
            BookingScreen()
        }
        composable("wallet") {
            WalletScreen()
        }
    }
}
