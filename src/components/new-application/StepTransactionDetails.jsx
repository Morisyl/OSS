import { Input } from '../common/Input';
import { calcBalance, formatCurrency } from '../../utils/formatters';

export const StepTransactionDetails = ({ data, updateData }) => {
  const balance = calcBalance(data.packagePrice, data.paidAmount);

  const getPaymentStatus = (paid, price) => {
    const safePaid = Number(paid) || 0;
    if (safePaid === 0) return 'Unpaid';
    if (safePaid >= price) return 'Paid';
    return 'Partial';
  };

  const handlePaidChange = (val) => {
    const status = getPaymentStatus(val, data.packagePrice);
    updateData({ paidAmount: val, paymentStatus: status });
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <Input
        label="Company Name"
        placeholder="Enter company or business name"
        value={data.companyName}
        onChange={(e) => updateData({ companyName: e.target.value })}
      />
      
      <div className="flex gap-4">
        <Input
          label="Amount Paid (KES)"
          type="number"
          placeholder="0"
          value={data.paidAmount}
          onChange={(e) => handlePaidChange(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
            Balance
          </label>
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full font-bold text-black dark:text-white border border-transparent">
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      <div className="ml-2">
        <span className="text-sm font-semibold text-gray-500">
          Auto-Status: <span className={`font-bold ${data.paymentStatus === 'Paid' ? 'text-green-600' : data.paymentStatus === 'Partial' ? 'text-orange-500' : 'text-red-500'}`}>{data.paymentStatus}</span>
        </span>
      </div>

      <Input
        label="Comments (Optional)"
        placeholder="Any additional notes..."
        value={data.comments}
        onChange={(e) => updateData({ comments: e.target.value })}
      />
    </div>
  );
};