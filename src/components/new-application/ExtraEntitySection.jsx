'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DynamicFormRender } from '../common/DynamicFormRender';

export const ExtraEntitySection = ({ entity, formData, updateData }) => {
  const [fields, setFields] = useState([]);

  useEffect(() => {
    supabase
      .from('form_fields')
      .select('*')
      .eq('target_entity', entity)
      .order('sort_order')
      .then(({ data }) => { if (data) setFields(data); });
  }, [entity]);

  return (
    <DynamicFormRender
      fields={fields}
      formData={formData.customData?.[entity] || {}}
      onChange={(updated) => updateData({
        customData: { ...formData.customData, [entity]: updated }
      })}
    />
  );
};