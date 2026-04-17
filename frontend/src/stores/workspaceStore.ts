import { create } from 'zustand';
import api from '@/lib/api';

// ─── Types ──────────────────────────────────────────────────────────
export interface Workspace {
  id: number;
  workspace_name: string;
  category: string;
  category_label: string;
  custom_category: string | null;
  tone_of_voice: string | null;
  primary_colors: string[];
  logo_url: string | null;
  website_url: string | null;
  contact_email: string | null;
  phone_number: string | null;
  physical_address: string | null;
  dynamic_fields: Record<string, string>;
  target_audience: string | null;
  brand_guidelines: string | null;
}

interface WorkspaceState {
  workspace: Workspace | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  saveSuccess: boolean;
  hasChecked: boolean; // true once we've fetched from backend at least once
}

interface WorkspaceActions {
  fetchWorkspace: () => Promise<void>;
  updateWorkspace: (data: Partial<Workspace>) => Promise<void>;
  clearSaveSuccess: () => void;
  clearError: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

export const useWorkspaceStore = create<WorkspaceStore>()((set, get) => ({
  // ─── State ───────────────────────────────────────────────────────
  workspace: null,
  isLoading: false,
  isSaving: false,
  error: null,
  saveSuccess: false,
  hasChecked: false,

  // ─── Actions ─────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
  clearSaveSuccess: () => set({ saveSuccess: false }),

  fetchWorkspace: async () => {
    // Skip if already fetched this session (avoids duplicate calls)
    if (get().hasChecked && get().workspace !== undefined) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/workspaces/');
      set({ workspace: data, isLoading: false, hasChecked: true });
    } catch (err: any) {
      if (err.response?.status === 404) {
        set({ workspace: null, isLoading: false, hasChecked: true });
      } else {
        set({ error: 'Failed to load workspace.', isLoading: false, hasChecked: true });
      }
    }
  },

  updateWorkspace: async (data: Partial<Workspace>) => {
    const { workspace } = get();
    if (!workspace) return;
    set({ isSaving: true, error: null, saveSuccess: false });
    try {
      const { data: updated } = await api.patch(`/workspaces/${workspace.id}/`, data);
      set({ workspace: updated, isSaving: false, saveSuccess: true });
      // Auto-clear success state after 3s
      setTimeout(() => set({ saveSuccess: false }), 3000);
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to save changes.';
      set({ isSaving: false, error: message });
      throw err;
    }
  },
}));
