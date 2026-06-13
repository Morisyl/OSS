import { Input } from '../common/Input';

export const StepCompanyDetails = ({ data, updateData }) => (
  <div className="space-y-6 animate-scale-in">
    <Input
      label="Company Name"
      placeholder="Enter company or business name"
      value={data.companyName}
      onChange={(e) => updateData({ companyName: e.target.value })}
    />
  </div>
);