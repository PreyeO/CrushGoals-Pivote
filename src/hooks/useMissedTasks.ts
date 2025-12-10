import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Task } from './useTasks';

export function useMissedTasks() {
  const { user } = useAuth();
  const [missedTasks, setMissedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMissedTasks = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch tasks from past dates that are not completed
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .eq('user_id', user.id)
        .eq('completed', false)
        .lt('due_date', today)
        .order('due_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMissedTasks(data as Task[]);
    } catch (error) {
      console.error('Error fetching missed tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markTaskComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
      
      // Remove from missed tasks list
      setMissedTasks(prev => prev.filter(t => t.id !== taskId));
      return true;
    } catch (error) {
      console.error('Error marking task complete:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchMissedTasks();
  }, [user?.id]);

  const totalMissed = missedTasks.length;
  
  // Group by date
  const groupedByDate = missedTasks.reduce((acc, task) => {
    const date = task.due_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  return {
    missedTasks,
    groupedByDate,
    totalMissed,
    isLoading,
    markTaskComplete,
    refreshMissedTasks: fetchMissedTasks,
  };
}
