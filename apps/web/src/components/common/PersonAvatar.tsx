import React, { useState, useRef } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Button, useToast } from '@campusone/ui';
import { useApp } from '../../context/AppContext.tsx';
import { optimizeImage } from '../../utils/imageOptimizer.ts';
import { supabase } from '../../lib/supabase.ts';

export function pluralize(count: number, singular: string, plural?: string): string {
  const n = Number(count) || 0;
  const word = n === 1 ? singular : plural || `${singular}s`;
  return `${n} ${word}`;
}

export function extractInitials(name?: string): string {
  if (!name) return 'C1';
  const cleaned = name
    .replace(/^(Dr\.|Pharm\.|Prof\.|Mrs\.|Mr\.|Ms\.|Miss|Nurse|Sanitarian|Chief|Matron)\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'C1';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface PersonAvatarProps {
  name?: string;
  email?: string;
  matricNumber?: string;
  staffId?: string;
  code?: string;
  role?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'idcard';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PersonAvatarProps['size']>, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-20 text-xs',
  idcard: 'w-12 h-14 text-[10px]',
};

export const PersonAvatar: React.FC<PersonAvatarProps> = ({
  name,
  email,
  matricNumber,
  staffId,
  code,
  role,
  avatarUrl,
  size = 'sm',
  className = '',
}) => {
  const { resolveAvatarUrl } = useApp();
  const [imgError, setImgError] = useState(false);

  const resolvedUrl = resolveAvatarUrl({
    avatarUrl,
    email,
    matricNumber: matricNumber || code,
    staffId: staffId || code,
    name,
    role,
  });

  const sizeCls = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const initials = extractInitials(name);

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt={name || 'Profile'}
        onError={() => setImgError(true)}
        className={`${sizeCls} rounded-[4px] object-cover shrink-0 border border-slate-200 bg-white shadow-xs ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeCls} rounded-[4px] bg-[#0F7640] text-white font-bold flex items-center justify-center shrink-0 select-none shadow-xs ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};

export interface PhotoUploadControlProps {
  label?: string;
  name?: string;
  value?: string;
  onChange: (url: string) => void;
}

export const PhotoUploadControl: React.FC<PhotoUploadControlProps> = ({
  label = 'Profile Photograph',
  name,
  value,
  onChange,
}) => {
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'danger',
        title: 'Invalid File',
        message: 'Please select a valid image file (PNG, JPG, or WebP).',
      });
      return;
    }

    setIsUploading(true);
    try {
      const optimized = await optimizeImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.84 });
      let finalUrl = optimized.dataUrl;

      const filePath = `person-${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, optimized.file, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: pubData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl;
        }
      }

      onChange(finalUrl);
      showToast({
        type: 'success',
        title: 'Photo Attached',
        message: `Profile photo optimized (${optimized.compressionRatio}) and ready to save.`,
      });
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Photo Error',
        message: err?.message || 'Could not process image.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {value ? (
          <img
            src={value}
            alt={name || 'Preview'}
            className="w-11 h-11 rounded-[4px] object-cover border border-slate-200 bg-white shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-[4px] bg-emerald-100 text-[#0F7640] font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
            {extractInitials(name)}
          </div>
        )}
        <div className="min-w-0">
          <span className="font-bold text-slate-900 text-xs block">{label}</span>
          <span className="text-[11px] text-slate-500 block truncate">
            {value ? 'Custom passport photo attached' : 'Upload passport photo (JPG, PNG, WebP)'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          isLoading={isUploading}
          leftIcon={<Camera className="w-3.5 h-3.5" />}
          onClick={() => inputRef.current?.click()}
        >
          {value ? 'Change' : 'Upload Photo'}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => onChange('')}
            title="Remove photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
