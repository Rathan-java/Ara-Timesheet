import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import 'models/task_model.dart';
import 'utils/app_colors.dart';
import 'utils/app_routes.dart';

// Auth Screens
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';

// Employee Screens
import 'screens/employee/employee_dashboard.dart';
import 'screens/employee/task_list_screen.dart';
import 'screens/employee/task_detail_screen.dart';
import 'screens/employee/create_task_screen.dart';

// Team Lead Screens
import 'screens/team_lead/tl_dashboard.dart';
import 'screens/team_lead/team_tasks_screen.dart';
import 'screens/team_lead/assign_task_screen.dart';

// Management Screens
import 'screens/management/management_dashboard.dart';
import 'screens/management/all_employees_screen.dart';
import 'screens/management/workspaces_screen.dart';

import 'screens/management/assign_task_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  runApp(const TimesheetApp());
}

class TimesheetApp extends StatelessWidget {
  const TimesheetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Timesheet Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        // Apply Poppins font family globally
        textTheme: GoogleFonts.poppinsTextTheme().apply(
          bodyColor: AppColors.textPrimary,
          displayColor: AppColors.textPrimary,
        ),
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          brightness: Brightness.light,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.cardBackground,
          error: AppColors.error,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.cardBackground,
          elevation: 0,
          scrolledUnderElevation: 1,
          iconTheme: const IconThemeData(color: AppColors.textPrimary),
          titleTextStyle: GoogleFonts.poppins(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        cardTheme: CardThemeData(
          color: AppColors.cardBackground,
          elevation: 1,
          shadowColor: Colors.black.withOpacity(0.1),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.cardBackground,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.divider),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 12,
          ),
          labelStyle: GoogleFonts.poppins(color: AppColors.textSecondary),
          hintStyle: GoogleFonts.poppins(color: AppColors.textLight),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(4),
            ),
          ),
        ),
        bottomNavigationBarTheme: BottomNavigationBarThemeData(
          backgroundColor: AppColors.navyDark,
          selectedItemColor: Colors.white,
          unselectedItemColor: const Color(0xFF8993A4),
          type: BottomNavigationBarType.fixed,
          elevation: 8,
          selectedLabelStyle: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
          unselectedLabelStyle: GoogleFonts.poppins(fontSize: 12),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 4,
        ),
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.surfaceLight,
          selectedColor: AppColors.primary,
          labelStyle: GoogleFonts.poppins(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        ),
        dividerTheme: const DividerThemeData(
          color: AppColors.divider,
          thickness: 1,
        ),
      ),
      initialRoute: AppRoutes.login,
      onGenerateRoute: (settings) {
        switch (settings.name) {
          // Auth Routes
          case AppRoutes.login:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
          // case AppRoutes.register:
          //   return MaterialPageRoute(builder: (_) => const RegisterScreen());

          // Employee Routes
          case AppRoutes.employeeDashboard:
            return MaterialPageRoute(builder: (_) => const EmployeeDashboard());
          case AppRoutes.taskList:
            return MaterialPageRoute(builder: (_) => const TaskListScreen());
          case AppRoutes.taskDetail:
            final task = settings.arguments as Task;
            return MaterialPageRoute(
              builder: (_) => TaskDetailScreen(task: task),
            );
          case AppRoutes.createTask:
            return MaterialPageRoute(builder: (_) => const CreateTaskScreen());

          // Team Lead Routes
          case AppRoutes.tlDashboard:
            return MaterialPageRoute(builder: (_) => const TLDashboard());
          case AppRoutes.teamTasks:
            return MaterialPageRoute(builder: (_) => const TeamTasksScreen());
          case AppRoutes.assignTask:
            return MaterialPageRoute(builder: (_) => const AssignTaskScreen());

          // Management Routes
          case AppRoutes.managementDashboard:
            return MaterialPageRoute(
              builder: (_) => const ManagementDashboard(),
            );
          case AppRoutes.allEmployees:
            return MaterialPageRoute(
              builder: (_) => const AllEmployeesScreen(),
            );
          case AppRoutes.workspaces:
            return MaterialPageRoute(builder: (_) => const WorkspacesScreen());
          // case AppRoutes.reports:
          //   return MaterialPageRoute(builder: (_) => const ReportsScreen());
          case AppRoutes.managementAssignTask:
            return MaterialPageRoute(
              builder: (_) => const ManagementAssignTaskScreen(),
            );

          default:
            return MaterialPageRoute(builder: (_) => const LoginScreen());
        }
      },
    );
  }
}
