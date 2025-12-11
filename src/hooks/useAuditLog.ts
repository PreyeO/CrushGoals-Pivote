import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Json } from '@/integrations/supabase/types';

interface AuditLogEntry {
  action: string;
  target_table?: string;
  target_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user, isAdmin } = useAuth();

  const logAction = async (entry: AuditLogEntry) => {
    if (!user || !isAdmin) return;

    try {
      const insertData = {
        admin_id: user.id,
        action: entry.action,
        target_table: entry.target_table || null,
        target_id: entry.target_id || null,
        old_values: (entry.old_values as Json) || null,
        new_values: (entry.new_values as Json) || null,
        user_agent: navigator.userAgent,
      };
      
      await supabase.from('admin_audit_logs').insert(insertData);
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const getAuditLogs = async (limit = 50) => {
    if (!isAdmin) return [];

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data;
  };

  return { logAction, getAuditLogs };
}
