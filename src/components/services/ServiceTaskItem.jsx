import { useState, useEffect } from 'react';
import { updateTaskStatus } from '../../services/transaction-services.service';

export const ServiceTaskItem = ({ task }) => {
  // Local state for optimistic UI updates
  const [isDone, setIsDone] = useState(task.task_status === 'Done');

  // Sync local state if real-time update comes from elsewhere
  useEffect(() => {
    setIsDone(task.task_status === 'Done');
  }, [task.task_status]);

  const handleToggle = async () => {
    const newStatus = isDone ? 'Pending' : 'Done';
    
    // 1. Optimistic Update: Instantly flip the UI
    setIsDone(!isDone);
    
    // 2. Background Database Update
    try {
      await updateTaskStatus(task.id, newStatus);
    } catch (error) {
      // Revert UI if the network request fails
      console.error("Failed to update task:", error);
      setIsDone(isDone); 
    }
  };

  return (
    <label className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none
      ${isDone 
        ? 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900' 
        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-black dark:hover:border-white'
      }`}
    >
      <input 
        type="checkbox" 
        checked={isDone}
        onChange={handleToggle}
        className="w-6 h-6 rounded-md border-gray-300 text-black dark:text-white accent-black dark:accent-white focus:ring-black"
      />
      <span className={`font-medium text-lg transition-colors ${isDone ? 'text-green-700 dark:text-green-400 line-through opacity-70' : 'text-black dark:text-white'}`}>
        {task.services?.name}
      </span>
    </label>
  );
};