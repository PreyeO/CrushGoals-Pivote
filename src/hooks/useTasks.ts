import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  time_estimate: string | null;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  due_date: string;
  created_at: string;
  completed_at: string | null;
  goal?: {
    id: string;
    name: string;
    emoji: string;
  };
}

export function useTasks(date?: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (date) {
        query = query.eq('due_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: {
    title: string;
    goal_id?: string;
    time_estimate?: string;
    priority?: 'high' | 'medium' | 'low';
    due_date?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          title: taskData.title,
          goal_id: taskData.goal_id || null,
          time_estimate: taskData.time_estimate || null,
          priority: taskData.priority || 'medium',
          due_date: taskData.due_date || new Date().toISOString().split('T')[0],
        })
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => [data as Task, ...prev]);
      toast.success('Task added!');
      return data as Task;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      return null;
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      const updates: any = {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .single();

      if (error) throw error;
      
      const updatedTasks = tasks.map(t => t.id === taskId ? data as Task : t);
      setTasks(updatedTasks);

      // Update user stats if completing task
      if (completed && user) {
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('tasks_completed, total_xp, current_streak, longest_streak, perfect_days, last_activity_date')
          .eq('user_id', user.id)
          .single();
        
        if (currentStats) {
          const statsUpdate: any = {
            tasks_completed: (currentStats.tasks_completed || 0) + 1,
            total_xp: (currentStats.total_xp || 0) + 10,
          };

          // Check if all tasks for today are now completed (Perfect Day)
          const todayStr = new Date().toISOString().split('T')[0];
          const todayTasks = updatedTasks.filter(t => t.due_date === todayStr);
          const allCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed);

          if (allCompleted) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const lastActivity = currentStats.last_activity_date 
              ? new Date(currentStats.last_activity_date)
              : null;
            
            if (lastActivity) {
              lastActivity.setHours(0, 0, 0, 0);
            }

            // Check if we already counted today
            const alreadyCountedToday = lastActivity && lastActivity.getTime() === today.getTime();

            if (!alreadyCountedToday) {
              // Check if yesterday was also a perfect day (continuing streak)
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              const isConsecutive = lastActivity && lastActivity.getTime() === yesterday.getTime();
              
              const newStreak = isConsecutive 
                ? (currentStats.current_streak || 0) + 1 
                : 1;
              
              statsUpdate.current_streak = newStreak;
              statsUpdate.longest_streak = Math.max(newStreak, currentStats.longest_streak || 0);
              statsUpdate.perfect_days = (currentStats.perfect_days || 0) + 1;
              statsUpdate.last_activity_date = todayStr;
              statsUpdate.total_xp = statsUpdate.total_xp + 100; // Perfect Day bonus!

              toast.success('🔥 Perfect Day! +100 XP bonus!', {
                description: `Streak: ${newStreak} day${newStreak > 1 ? 's' : ''}`,
              });
            }
          }

          await supabase
            .from('user_stats')
            .update(statsUpdate)
            .eq('user_id', user.id);
        }
      }

      return data as Task;
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select(`
          *,
          goal:goals(id, name, emoji)
        `)
        .single();

      if (error) throw error;
      
      setTasks(prev => prev.map(t => t.id === taskId ? data as Task : t));
      toast.success('Task updated');
      return data as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return null;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();

    // Set up realtime subscription
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, date]);

  return {
    tasks,
    isLoading,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}
