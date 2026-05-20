import 'package:flutter/material.dart';

class AppColors {
  // Jira Primary colors
  static const Color primary = Color(0xFF0052CC);  // Jira blue
  static const Color primaryLight = Color(0xFF4C9AFF);
  static const Color primaryDark = Color(0xFF0747A6);

  // Sidebar/Dark colors
  static const Color navyDark = Color(0xFF172B4D);
  static const Color navyLight = Color(0xFF253858);

  // Secondary colors
  static const Color secondary = Color(0xFF00875A);  // Green
  static const Color secondaryLight = Color(0xFF36B37E);

  // Background colors
  static const Color background = Color(0xFFF4F5F7);  // Jira light gray
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color surfaceLight = Color(0xFFEBECF0);
  static const Color kanbanBackground = Color(0xFFF4F5F7);

  // Text colors - Black theme
  static const Color textPrimary = Color(0xFF000000);    // Pure black
  static const Color textSecondary = Color(0xFF333333);  // Dark gray
  static const Color textLight = Color(0xFF666666);      // Medium gray

  // Status colors - Jira style
  static const Color todoGray = Color(0xFF97A0AF);        // Todo - gray
  static const Color todoBlue = Color(0xFF0052CC);         // Blue variant
  static const Color progressBlue = Color(0xFF0065FF);     // In Progress - blue
  static const Color progressOrange = Color(0xFFFF991F);   // In Progress - orange variant
  static const Color doneGreen = Color(0xFF00875A);        // Done - green
  static const Color reviewPurple = Color(0xFF6554C0);     // Review - purple

  // Priority colors - Jira style
  static const Color priorityHighest = Color(0xFFCD1316);  // Highest - red
  static const Color priorityHigh = Color(0xFFE97F33);     // High - orange-red
  static const Color priorityMedium = Color(0xFFFFAB00);   // Medium - orange/yellow
  static const Color priorityLow = Color(0xFF0065FF);      // Low - blue
  static const Color priorityLowest = Color(0xFF57D9A3);   // Lowest - light green

  // Legacy priority mappings (for backward compatibility)
  static const Color priorityUrgent = priorityHighest;

  // Other colors
  static const Color error = Color(0xFFDE350B);
  static const Color success = Color(0xFF00875A);
  static const Color warning = Color(0xFFFF991F);
  static const Color info = Color(0xFF0065FF);
  static const Color divider = Color(0xFFDFE1E6);

  // Workspace colors
  static const Color workspaceSchoolate = Color(0xFF0052CC);
  static const Color workspaceCRM = Color(0xFF00875A);
  static const Color workspaceHRMS = Color(0xFFFF991F);
  static const Color workspaceInventory = Color(0xFF6554C0);

  // Kanban column colors
  static const Color columnTodo = Color(0xFF97A0AF);
  static const Color columnInProgress = Color(0xFF0052CC);
  static const Color columnDone = Color(0xFF00875A);
  static const Color columnReview = Color(0xFF6554C0);

  // Issue type colors
  static const Color issueStory = Color(0xFF36B37E);
  static const Color issueBug = Color(0xFFDE350B);
  static const Color issueTask = Color(0xFF4C9AFF);
  static const Color issueEpic = Color(0xFF6554C0);

  // Label colors
  static const Color labelBlue = Color(0xFF4C9AFF);
  static const Color labelGreen = Color(0xFF57D9A3);
  static const Color labelYellow = Color(0xFFFFE380);
  static const Color labelRed = Color(0xFFFF8F73);
  static const Color labelPurple = Color(0xFFB3BAC5);
}
