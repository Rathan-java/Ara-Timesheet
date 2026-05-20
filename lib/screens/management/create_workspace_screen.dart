import 'package:flutter/material.dart';
import '../../data/mock_data.dart';
import '../../models/workspace_model.dart';
import '../../utils/app_colors.dart';

class CreateWorkspaceScreen extends StatefulWidget {
  const CreateWorkspaceScreen({super.key});

  @override
  State<CreateWorkspaceScreen> createState() => _CreateWorkspaceScreenState();
}

class _CreateWorkspaceScreenState extends State<CreateWorkspaceScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _projectCodeController = TextEditingController();

  Color _selectedColor = AppColors.primary;
  IconData _selectedIcon = Icons.folder;
  List<String> _selectedMemberIds = [];
  bool _isLoading = false;

  final List<Color> _colorOptions = [
    AppColors.primary,
    AppColors.workspaceCRM,
    AppColors.workspaceHRMS,
    AppColors.workspaceInventory,
    const Color(0xFFFF5630),
    const Color(0xFF00B8D9),
    const Color(0xFF36B37E),
    const Color(0xFF6554C0),
  ];

  final List<IconData> _iconOptions = [
    Icons.folder,
    Icons.school,
    Icons.people,
    Icons.business,
    Icons.inventory_2,
    Icons.shopping_cart,
    Icons.analytics,
    Icons.code,
    Icons.design_services,
    Icons.security,
    Icons.cloud,
    Icons.smartphone,
  ];

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _projectCodeController.dispose();
    super.dispose();
  }

  void _createWorkspace() {
    if (_formKey.currentState!.validate()) {
      if (_selectedMemberIds.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Please select at least one team member'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      // Check if project code already exists
      final existingWorkspace = MockData.workspaces.any(
        (ws) =>
            ws.projectCode.toUpperCase() ==
            _projectCodeController.text.toUpperCase(),
      );

      if (existingWorkspace) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Project code already exists'),
            backgroundColor: AppColors.error,
          ),
        );
        return;
      }

      setState(() => _isLoading = true);

      // Create the new workspace
      final newWorkspace = Workspace(
        id: 'ws${DateTime.now().millisecondsSinceEpoch}',
        name: _nameController.text,
        description: _descriptionController.text,
        color: _selectedColor,
        icon: _selectedIcon,
        totalTasks: 0,
        completedTasks: 0,
        memberIds: _selectedMemberIds,
        projectCode: _projectCodeController.text.toUpperCase(),
        nextIssueNumber: 1,
      );

      // Simulate API call
      Future.delayed(const Duration(milliseconds: 800), () {
        MockData.workspaces.add(newWorkspace);

        setState(() => _isLoading = false);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Workspace "${newWorkspace.name}" created successfully!',
            ),
            backgroundColor: AppColors.success,
          ),
        );

        Navigator.pop(context, true);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.cardBackground,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Create Workspace',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Workspace Preview Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_selectedColor, _selectedColor.withOpacity(0.7)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(_selectedIcon, color: Colors.white, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _nameController.text.isEmpty
                                ? 'Workspace Name'
                                : _nameController.text,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _projectCodeController.text.isEmpty
                                ? 'CODE'
                                : _projectCodeController.text.toUpperCase(),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white.withOpacity(0.8),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Workspace Name
              _buildSectionLabel('Workspace Name'),
              TextFormField(
                controller: _nameController,
                decoration: _inputDecoration(
                  hint: 'e.g. Project Management',
                  icon: Icons.folder_outlined,
                ),
                onChanged: (_) => setState(() {}),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter workspace name';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Project Code
              _buildSectionLabel('Project Code'),
              TextFormField(
                controller: _projectCodeController,
                textCapitalization: TextCapitalization.characters,
                maxLength: 5,
                decoration:
                    _inputDecoration(
                      hint: 'e.g. PM, CRM, HRM',
                      icon: Icons.code,
                    ).copyWith(
                      counterText: '',
                      helperText: 'Short code for issue keys (e.g., PM-123)',
                    ),
                onChanged: (_) => setState(() {}),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a project code';
                  }
                  if (value.length < 2) {
                    return 'Code must be at least 2 characters';
                  }
                  if (!RegExp(r'^[A-Za-z]+$').hasMatch(value)) {
                    return 'Only letters allowed';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Description
              _buildSectionLabel('Description'),
              TextFormField(
                controller: _descriptionController,
                maxLines: 3,
                decoration: _inputDecoration(
                  hint: 'Describe the workspace purpose...',
                  icon: Icons.description_outlined,
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a description';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Color Selection
              _buildSectionLabel('Color'),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: _colorOptions.map((color) {
                    final isSelected = _selectedColor == color;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedColor = color),
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: color,
                          shape: BoxShape.circle,
                          border: isSelected
                              ? Border.all(
                                  color: AppColors.textPrimary,
                                  width: 3,
                                )
                              : null,
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: color.withOpacity(0.4),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : null,
                        ),
                        child: isSelected
                            ? const Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 20,
                              )
                            : null,
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 24),

              // Icon Selection
              _buildSectionLabel('Icon'),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Wrap(
                  spacing: 12,
                  runSpacing: 12,
                  children: _iconOptions.map((icon) {
                    final isSelected = _selectedIcon == icon;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedIcon = icon),
                      child: Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: isSelected
                              ? _selectedColor.withOpacity(0.1)
                              : AppColors.surfaceLight,
                          borderRadius: BorderRadius.circular(8),
                          border: isSelected
                              ? Border.all(color: _selectedColor, width: 2)
                              : null,
                        ),
                        child: Icon(
                          icon,
                          color: isSelected
                              ? _selectedColor
                              : AppColors.textSecondary,
                          size: 24,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 24),

              // Team Members Selection
              _buildSectionLabel('Team Members'),
              Container(
                decoration: BoxDecoration(
                  color: AppColors.cardBackground,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.divider),
                ),
                child: Column(
                  children: [
                    // Selected count header
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceLight,
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(8),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.people_outline,
                            size: 20,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '${_selectedMemberIds.length} members selected',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Employee list
                    ...MockData.employees.map((employee) {
                      final isSelected = _selectedMemberIds.contains(
                        employee.id,
                      );
                      return CheckboxListTile(
                        value: isSelected,
                        onChanged: (value) {
                          setState(() {
                            if (value == true) {
                              _selectedMemberIds.add(employee.id);
                            } else {
                              _selectedMemberIds.remove(employee.id);
                            }
                          });
                        },
                        activeColor: _selectedColor,
                        title: Text(
                          employee.name,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        subtitle: Text(
                          employee.designation,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        secondary: CircleAvatar(
                          radius: 18,
                          backgroundColor: _selectedColor.withOpacity(0.1),
                          child: Text(
                            employee.name.substring(0, 1),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: _selectedColor,
                            ),
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // Create Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _createWorkspace,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _selectedColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                          ),
                        )
                      : const Text(
                          'Create Workspace',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({
    required String hint,
    required IconData icon,
  }) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, color: AppColors.textSecondary),
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
        borderSide: BorderSide(color: _selectedColor, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.error),
      ),
    );
  }
}
