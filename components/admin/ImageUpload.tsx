'use client';

import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/Button';

export function ImageUpload({
  value,
  onChange,
  endpoint = '/api/admin/upload',
  maxSizeMB = 2,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  endpoint?: string;
  maxSizeMB?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Тек сурет файлы рұқсат етілген');
      return;
    }
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.8,
      });
      const fd = new FormData();
      fd.append('file', compressed, file.name);
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok || json.error) {
        toast.error(json.error ?? 'Жүктеу қатесі');
        return;
      }
      onChange(json.data.url);
      toast.success('Сурет жүктелді');
    } catch (err) {
      toast.error('Жүктеу қатесі');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      {value ? (
        <div className="relative w-full max-w-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="rounded-md border border-border max-h-[240px] object-contain w-full bg-bg-alt"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-pop border border-border flex items-center justify-center text-fg-muted hover:text-error"
            aria-label="Жою"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border-[1.5px] border-dashed border-border-strong rounded-lg p-7 flex flex-col items-center gap-2.5 bg-bg-alt hover:bg-white transition-colors w-full max-w-[420px]"
        >
          <div className="w-11 h-11 rounded-full bg-brand-light flex items-center justify-center">
            {uploading ? (
              <Upload size={20} className="text-brand animate-pulse" />
            ) : (
              <ImageIcon size={20} className="text-brand" />
            )}
          </div>
          <div className="text-sm font-semibold text-fg">
            {uploading ? 'Жүктелуде...' : 'Файлды осында тастаңыз'}
          </div>
          <div className="text-[13px] text-fg-muted">
            PNG, JPG, SVG · авто-сығу 1600px / 80%
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}
