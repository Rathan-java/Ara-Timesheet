// Maps workspace icon names (stored as strings so the data model stays portable)
// to lucide-react components. Extend as new icons are introduced.

import {
  Briefcase,
  Building2,
  Code,
  Database,
  Folder,
  GraduationCap,
  Layers,
  Package,
  Rocket,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react';

const REGISTRY = {
  GraduationCap,
  Users,
  Building2,
  Package,
  Briefcase,
  Code,
  Database,
  Folder,
  Layers,
  Rocket,
  Settings,
  ShoppingCart,
};

export const iconByName = (name) => REGISTRY[name];

export const workspaceIconOptions = [
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Users', icon: Users },
  { name: 'Building2', icon: Building2 },
  { name: 'Package', icon: Package },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Code', icon: Code },
  { name: 'Database', icon: Database },
  { name: 'Folder', icon: Folder },
  { name: 'Layers', icon: Layers },
  { name: 'Rocket', icon: Rocket },
  { name: 'Settings', icon: Settings },
  { name: 'ShoppingCart', icon: ShoppingCart },
];
