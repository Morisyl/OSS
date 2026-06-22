'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Input } from '../common/Input';
import { DynamicFormRender } from '../common/DynamicFormRender';

export const StepCompanyDetails = ({ data, updateData }) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    supabase
      .from('form_fields')
      .select('*')
      .eq('target_entity', 'company')
      .order('sort_order')
      .then(({ data: d }) => { if (d) setFields(d); });
  }, []);

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Fixed field — company name always exists */}
      <Input
        label="Company Name"
        placeholder="Enter company or business name"
        value={data.companyName}
        onChange={(e) => updateData({ companyName: e.target.value })}
      />

      {/* Dynamic fields from form_fields table */}
      <DynamicFormRender
        fields={fields}
        formData={data.companyDynamicData || {}}
        onChange={(updated) => updateData({ companyDynamicData: updated })}
      />
    </div>
  );
};