import { apiRequest, mockDelay } from './apiClient';
import { USE_MOCK } from './config';

const MOCK_TEAMS = [
  { id: 'team1', name: 'Team 1', description: '' },
  { id: 'team2', name: 'Team 2', description: '' },
];

const teamFromBackend = (t) => ({
  id: String(t.id),
  name: t.name,
  description: t.description ?? '',
  memberCount: Number(t.member_count) || 0,
});

export const teamService = {
  async getAll() {
    if (USE_MOCK) {
      await mockDelay();
      return [...MOCK_TEAMS];
    }
    const rows = await apiRequest('/teams');
    return rows
      .map(teamFromBackend)
      .sort((a, b) => a.name.localeCompare(b.name));
  },
};
