'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { AdminRole, AdminUser } from '@/types';
import { authService } from '@/services/auth.service';
import { Users, Mail, Shield, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AdminUser | null;
  onSuccess?: () => void;
}

export function InviteUserModal({ isOpen, onClose, user, onSuccess }: InviteUserModalProps) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: AdminRole.ADMIN,
  });
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
      setInviteLink(null);
    } else {
      setFormData({ name: '', email: '', role: AdminRole.ADMIN });
      setInviteLink(null);
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && user) {
        await authService.updateMember(user.id, {
            name: formData.name,
            role: formData.role
        });
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        const response = await authService.invite(formData);
        setInviteLink(response.inviteLink);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setInviteLink(null);
    if (!isEditMode) {
        setFormData({ name: '', email: '', role: AdminRole.ADMIN });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Team Member" : "Invite Team Member"}
      size="md"
    >
      {!inviteLink ? (
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                required
                className="pl-9"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                required
                type="email"
                className="pl-9"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isEditMode} // Cannot edit email for now
              />
            </div>
            {isEditMode && <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
              >
                <option value={AdminRole.ADMIN}>Admin</option>
                <option value={AdminRole.MODERATOR}>Moderator</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {formData.role === AdminRole.ADMIN && 'Can manage users, products, and orders.'}
              {formData.role === AdminRole.MODERATOR && 'Can moderate user content and chats.'}
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {isEditMode ? 'Save Changes' : 'Send Invite'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="p-6 space-y-4">
          <div className="bg-green-50 text-green-800 p-4 rounded-lg flex items-start gap-3">
            <Check className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">User invited successfully!</p>
              <p className="text-sm mt-1">
                Share this link with them to set up their password.
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 uppercase font-semibold">Invite Link</p>
            <div className="flex items-center gap-2">
              <code className="text-sm text-gray-800 break-all flex-1 font-mono bg-white p-2 rounded border border-gray-200">
                {inviteLink}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
