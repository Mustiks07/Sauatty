'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { AVATAR_PRESETS, type AvatarPreset, avatarGradient } from '@/lib/avatar';
import { apiFetch } from '@/lib/api-fetch';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type Initial = {
  name: string;
  avatarPreset: AvatarPreset;
  examDate: string;
  phone: string | null;
  email: string | null;
};

export function EditForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [preset, setPreset] = useState<AvatarPreset>(initial.avatarPreset);
  const [examDate, setExamDate] = useState(initial.examDate);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  async function saveProfile() {
    if (name.trim().length < 2) {
      toast.error('Атың тым қысқа');
      return;
    }
    setSavingProfile(true);
    try {
      await apiFetch('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: name.trim(),
          avatarPreset: preset,
          examDate: examDate || null,
        }),
      });
      toast.success('Профиль жаңартылды');
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (newPw.length < 8) {
      toast.error('Кемінде 8 таңба');
      return;
    }
    setSavingPw(true);
    try {
      await apiFetch('/api/user/password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: newPw }),
      });
      toast.success('Құпиясөз жаңартылды');
      setNewPw('');
    } finally {
      setSavingPw(false);
    }
  }

  async function deleteAccount() {
    if (confirmText !== 'Жою') {
      toast.error('«Жою» сөзін енгізіңіз');
      return;
    }
    setDeleting(true);
    try {
      await apiFetch('/api/user/account', {
        method: 'DELETE',
        body: JSON.stringify({ confirm: 'Жою' }),
      });
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('Аккаунт жойылды');
      router.push('/');
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Profile section */}
      <Card className="p-6">
        <h2 className="sa-display text-[18px] font-semibold mb-5">Жеке мәліметтер</h2>

        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          <div
            className="w-[88px] h-[88px] rounded-full text-white flex items-center justify-center text-[32px] font-bold font-display flex-shrink-0"
            style={{
              background: avatarGradient(preset),
              lineHeight: 1,
            }}
          >
            {(name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 w-full">
            <Label htmlFor="name">Аты</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
          </div>
        </div>

        <div className="mb-6">
          <Label>Аватар түсі</Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(Object.entries(AVATAR_PRESETS) as [AvatarPreset, (typeof AVATAR_PRESETS)['blue-amber']][]).map(
              ([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPreset(key)}
                  className={cn(
                    'aspect-square rounded-lg transition-all',
                    preset === key
                      ? 'ring-2 ring-brand ring-offset-2'
                      : 'hover:scale-105',
                  )}
                  title={val.label}
                  style={{
                    background: `linear-gradient(135deg, ${val.from} 0%, ${val.to} 100%)`,
                  }}
                  aria-label={val.label}
                />
              ),
            )}
          </div>
        </div>

        <div className="mb-6">
          <Label htmlFor="exam">ҰБТ күні (қалауыңша)</Label>
          <Input
            id="exam"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            max="2030-12-31"
          />
          <p className="text-[12px] text-fg-muted mt-1.5">
            Дашбордта «ҰБТ-ға қанша күн қалды» деп көрсетіледі.
          </p>
        </div>

        <div className="text-[13px] text-fg-muted mb-1">
          Телефон: <span className="sa-num text-fg">{initial.phone ?? '—'}</span>
        </div>
        {initial.email && (
          <div className="text-[13px] text-fg-muted mb-5">
            Email: <span className="text-fg">{initial.email}</span>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={saveProfile} disabled={savingProfile}>
            <Save size={14} /> Сақтау
          </Button>
        </div>
      </Card>

      {/* Password section — only show if user has phone (i.e. signed up with password) */}
      {initial.phone && (
        <Card className="p-6">
          <h2 className="sa-display text-[18px] font-semibold mb-1">
            Құпиясөзді өзгерту
          </h2>
          <p className="text-sm text-fg-muted mb-4">
            Кемінде 8 таңба, бір әріп пен бір сан.
          </p>
          <div className="relative max-w-[360px] mb-4">
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="Жаңа құпиясөз"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="pr-10"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-muted p-1"
              aria-label="Show password"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-end">
            <Button onClick={savePassword} disabled={savingPw || !newPw}>
              <KeyRound size={14} /> Жаңарту
            </Button>
          </div>
        </Card>
      )}

      {/* Danger zone */}
      <Card className="p-6 border-error-light">
        <h2 className="sa-display text-[18px] font-semibold text-error-ink mb-1">
          Қауіпті аймақ
        </h2>
        <p className="text-sm text-fg-muted mb-4">
          Аккаунтты жоғалтсаң, барлық тапсыруларың, нәтижелерің және қаралама
          суреттерің мәңгілікке өшіріледі.
        </p>
        <Button
          variant="outlineDanger"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 size={14} /> Аккаунтты жою
        </Button>
      </Card>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-[480px] bg-white rounded-xl shadow-modal border border-border p-5 sm:p-7">
            <div className="flex items-start gap-3 sm:gap-3.5">
              <div className="w-10 h-10 rounded-full bg-error-light flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} className="text-error" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="sa-display text-[17px] sm:text-[19px] font-semibold tracking-[-0.01em]">
                  Аккаунтты жоюды растайсың ба?
                </div>
                <div className="text-sm text-fg-muted mt-1.5 leading-[1.5]">
                  Жалғастыру үшін төмендегі өріске{' '}
                  <span className="font-semibold text-fg">«Жою»</span> сөзін
                  жаз.
                </div>
                <Input
                  className="mt-4"
                  placeholder="Жою"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 mt-5 sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmText('');
                }}
                className="w-full sm:w-auto"
              >
                Бас тарту
              </Button>
              <Button
                variant="danger"
                onClick={deleteAccount}
                disabled={confirmText !== 'Жою' || deleting}
                className="w-full sm:w-auto"
              >
                {deleting ? '...' : 'Аккаунтты мәңгілікке жою'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
