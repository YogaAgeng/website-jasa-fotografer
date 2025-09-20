import { useState } from 'react';
import type { CreateSessionDto } from '../../api/whatsappTypes';
import Button from '../ui/Button';
import { Plus, X } from 'lucide-react';

interface SessionFormProps {
  onSubmit: (data: CreateSessionDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  initialData?: CreateSessionDto;
}

export default function SessionForm({ onSubmit, onCancel, loading = false, initialData }: SessionFormProps) {
  const [formData, setFormData] = useState<CreateSessionDto>({
    sessionId: initialData?.sessionId || '',
    deviceType: initialData?.deviceType || 'android'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.sessionId && formData.sessionId.trim().length < 3) {
      newErrors.sessionId = 'Session ID must be at least 3 characters long';
    }

    if (formData.sessionId && !/^[a-zA-Z0-9_-]+$/.test(formData.sessionId)) {
      newErrors.sessionId = 'Session ID can only contain letters, numbers, hyphens, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleInputChange = (field: keyof CreateSessionDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {initialData ? 'Edit Session' : 'Create New Session'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          leftIcon={<X className="w-4 h-4" />}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-1">
            Session ID
          </label>
          <input
            type="text"
            id="sessionId"
            value={formData.sessionId}
            onChange={(e) => handleInputChange('sessionId', e.target.value)}
            placeholder="Enter custom session ID (optional)"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.sessionId ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.sessionId && (
            <p className="mt-1 text-sm text-red-600">{errors.sessionId}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Leave empty to auto-generate. Only letters, numbers, hyphens, and underscores allowed.
          </p>
        </div>

        <div>
          <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1">
            Device Type
          </label>
          <select
            id="deviceType"
            value={formData.deviceType}
            onChange={(e) => handleInputChange('deviceType', e.target.value as 'android' | 'ios' | 'web')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="android">Android</option>
            <option value="ios">iOS</option>
            <option value="web">Web</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Select the device type for this WhatsApp session.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            leftIcon={<Plus className="w-4 h-4" />}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Creating...' : (initialData ? 'Update Session' : 'Create Session')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
