import { Input } from '../common/Input';
import { calcBalance, formatCurrency } from '../../utils/formatters';

// NEW FILE: src/components/new-application/StepComments.jsx

export const StepComments = ({ data, updateData }) => (
  <div className="space-y-6 animate-scale-in">
    {/* Binary payment toggle */}
    <div>
      <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
        Payment Status
      </label>
      <div className="grid grid-cols-2 gap-4">
        {[{ label: 'Paid', value: true }, { label: 'Not Paid', value: false }].map(opt => (
          <label
            key={String(opt.value)}
            className={`
              p-4 rounded-3xl border-2 cursor-pointer flex items-center gap-3 transition-all
              ${data.isPaid === opt.value
                ? 'border-black bg-gray-50 dark:border-white dark:bg-gray-800'
                : 'border-transparent bg-gray-100 dark:bg-gray-900'
              }
            `}
          >
            <input
              type="radio"
              name="isPaid"
              checked={data.isPaid === opt.value}
              onChange={() => updateData({ isPaid: opt.value })}
              className="w-5 h-5 accent-black dark:accent-white"
            />
            <span className="font-bold">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Comments */}
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
        Comments (Optional)
      </label>
      <textarea
        rows={4}
        placeholder="Any additional notes..."
        value={data.comments}
        onChange={(e) => updateData({ comments: e.target.value })}
        className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-sm font-medium resize-none outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
      />
    </div>
  </div>
);