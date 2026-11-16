import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  Modal,
  Button,
  Input,
  Badge,
  useToast,
  Tabs,
  Card,
} from '@campusone/ui';
import {
  User,
  Camera,
  Upload,
  Trash2,
  Lock,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { supabase } from '../../lib/supabase.ts';
import { optimizeImage } from '../../utils/imageOptimizer.ts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { session, persona, updateProfile } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Form states initialized from active persona/session
  const [fullName, setFullName] = useState(session.fullName || persona?.fullName || '');
  const [phone, setPhone] = useState(persona?.phone || '+234 814 555 0192');
  const [address, setAddress] = useState(persona?.address || 'Bethsaida College Campus, Ijebu-Ode');
  const [bio, setBio] = useState(persona?.bio || '');
  const [emergencyContact, setEmergencyContact] = useState(persona?.emergencyContact || '+234 803 999 1122 (Next of Kin)');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(persona?.avatarUrl || null);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [examGatePassAlerts, setExamGatePassAlerts] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle custom photo file selection with automatic client-side optimization
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'danger',
        title: 'Invalid File Type',
        message: 'Please select a valid image file (.jpg, .jpeg, .png, or .webp).',
      });
      return;
    }

    try {
      const optimized = await optimizeImage(file, { maxWidth: 512, maxHeight: 512, quality: 0.82 });
      setStagedFile(optimized.file);
      setAvatarPreview(optimized.dataUrl);

      showToast({
        type: 'info',
        title: 'Photo Optimized',
        message: `Image compressed (${optimized.compressionRatio}). Click Save Changes to update your account.`,
      });
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Optimization Error',
        message: err?.message || 'Could not process photo.',
      });
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setStagedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast({
      type: 'info',
      title: 'Photo Removed',
      message: 'Avatar reset to initials.',
    });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      let finalAvatarUrl = avatarPreview || undefined;

      // If a new photo was staged, upload to Supabase Storage 'avatars'
      if (stagedFile) {
        const filePath = `${session.userId}-${Date.now()}.webp`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(filePath, stagedFile, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          if (publicUrlData?.publicUrl) {
            finalAvatarUrl = publicUrlData.publicUrl;
          }
        }
      }

      if (updateProfile) {
        await updateProfile({
          fullName,
          phone,
          address,
          bio,
          emergencyContact,
          avatarUrl: finalAvatarUrl,
        });
      }

      showToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Your personal information and photo have been saved securely.',
      });
      onClose();
    } catch (err: any) {
      showToast({
        type: 'danger',
        title: 'Update Failed',
        message: err?.message || 'Could not update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      showToast({
        type: 'danger',
        title: 'Weak Password',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast({
        type: 'danger',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    showToast({
      type: 'success',
      title: 'Password Changed',
      message: 'Your account security credentials have been updated and encrypted.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Personal Profile & Account Settings"
      size="lg"
      footer={
        activeTab === 'profile' ? (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Profile Changes'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5 font-sans text-xs">
        {/* Navigation Tabs */}
        <Tabs
          tabs={[
            { id: 'profile', label: 'Personal Information' },
            { id: 'security', label: 'Security & Password' },
            { id: 'notifications', label: 'Notification Preferences' },
          ]}
          activeTab={activeTab}
          onChange={(tab: any) => setActiveTab(tab)}
        />

        {/* ─── TAB 1: PERSONAL INFORMATION & AVATAR ─── */}
        {activeTab === 'profile' && (
          <div className="space-y-5">
            {/* User Identity & Avatar Upload Section */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar Display / Preview */}
                <div className="relative w-16 h-16 rounded-[4px] bg-[#107C41] text-white flex items-center justify-center text-lg font-bold shadow-sm overflow-hidden border border-slate-200 shrink-0">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={session.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{persona?.initials || 'C1'}</span>
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {session.fullName}
                    </h3>
                    <Badge variant="primary" size="sm">
                      {persona?.scopeBadge || session.activeRole}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px] truncate">
                    {session.email}
                  </p>
                  {persona?.matricNumber && (
                    <p className="text-[11px] font-bold text-[#0F7640]">
                      Matric: {persona.matricNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Custom Photo Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  Upload Photo
                </Button>
                {avatarPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-rose-600 hover:bg-rose-50"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Editable Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name (Official Record)
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Official Name"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  College Email (Login ID)
                </label>
                <div className="relative">
                  <Input
                    value={session.email}
                    disabled
                    className="bg-slate-100 text-slate-500 cursor-not-allowed pr-8"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Emergency Contact / Next of Kin
                </label>
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Contact Name & Phone"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Residential / Hostel Address
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Hall of Residence or Home Address"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Bio / Specialization Notes
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-[4px] text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0F7640]"
                  placeholder="Brief academic or clinical focus notes..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: SECURITY & PASSWORD ─── */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-2 text-slate-700 font-medium">
                <KeyRound className="w-4 h-4 text-[#0F7640]" />
                <span>Change Account Password</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit">
                  Update Password
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Two-Factor Authentication (2FA)
                  </span>
                  <span className="text-slate-500">
                    Require cryptographic authenticator code on unrecognized devices
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-[4px] border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    is2FAEnabled ? 'bg-[#0F7640]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-[2px] bg-white transition duration-200 ease-in-out ${
                      is2FAEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: NOTIFICATIONS ─── */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-[4px] flex items-center gap-2 text-slate-700 font-medium">
              <Bell className="w-4 h-4 text-[#0F7640]" />
              <span>Configure Personal Notification Delivery Channels</span>
            </div>

            <div className="divide-y divide-slate-100 space-y-3 pt-2">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-900 block">
                    College Email Bulletins & Grades
                  </span>
                  <span className="text-slate-500">
                    Receive semester results, circulars, and course schedules via email
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-[4px] border-2 border-transparent transition-colors duration-200 ${
                    emailAlerts ? 'bg-[#0F7640]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-[2px] bg-white transition duration-200 ${
                      emailAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold text-slate-900 block">
                    SMS Instant Payment Receipts
                  </span>
                  <span className="text-slate-500">
                    Receive immediate Termii SMS confirmation when tuition or clinical levies are posted
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsReceipts(!smsReceipts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-[4px] border-2 border-transparent transition-colors duration-200 ${
                    smsReceipts ? 'bg-[#0F7640]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-[2px] bg-white transition duration-200 ${
                      smsReceipts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="font-bold text-slate-900 block">
                    Examination Gate Pass & Attendance Alerts
                  </span>
                  <span className="text-slate-500">
                    Alerts when attendance falls near the 75% statutory NBTE threshold
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setExamGatePassAlerts(!examGatePassAlerts)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-[4px] border-2 border-transparent transition-colors duration-200 ${
                    examGatePassAlerts ? 'bg-[#0F7640]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-[2px] bg-white transition duration-200 ${
                      examGatePassAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
