enum UserRole { employee, teamLead, management }

class User {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String? teamId;
  final String? avatarUrl;
  final String designation;
  final DateTime joinedDate;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.teamId,
    this.avatarUrl,
    required this.designation,
    required this.joinedDate,
  });

  String get roleDisplayName {
    switch (role) {
      case UserRole.employee:
        return 'Employee';
      case UserRole.teamLead:
        return 'Team Lead';
      case UserRole.management:
        return 'Management';
    }
  }
}
