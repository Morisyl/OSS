import { ServiceTaskItem } from './ServiceTaskItem';
import { Spinner } from '../common/Spinner';

export const ServiceTaskList = ({ tasks, loading }) => {
  if (loading) return <div className="py-8 flex justify-center"><Spinner className="w-6 h-6" color="text-black dark:text-white" /></div>;

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-600 text-gray-500">
        No tasks assigned to this transaction yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <h4 className="font-bold text-sm tracking-widest text-gray-400 uppercase mb-4 ml-2">Assigned Services</h4>
      {tasks.map(task => (
        <ServiceTaskItem key={task.id} task={task} />
      ))}
    </div>
  );
};