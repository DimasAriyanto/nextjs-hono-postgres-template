"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useCreateContact, useUpdateContact } from "../hooks/use-contact";
import { useToastActions } from "@/contexts/toast-context";
import type { Contact, CreateContact, UpdateContact } from "@/schemas";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  mode: "create" | "edit";
}

export function ContactFormModal({
  isOpen,
  onClose,
  contact,
  mode,
}: ContactFormModalProps) {
  const toast = useToastActions();
  const createMutation = useCreateContact();
  const updateMutation = useUpdateContact();

  const [formData, setFormData] = useState<CreateContact>({
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    contact_type: "customer",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contact && mode === "edit") {
      // Get primary email and phone for editing
      const primaryEmail =
        contact.emails?.find((e) => e.is_primary)?.email ||
        contact.emails?.[0]?.email ||
        "";
      const primaryPhone =
        contact.phones?.find((p) => p.is_primary)?.phone ||
        contact.phones?.[0]?.phone ||
        "";

      setFormData({
        name: contact.primary_name,
        email: primaryEmail,
        phone: primaryPhone,
        address: contact.address || "",
        description: contact.description || "",
        contact_type: contact.contact_type,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        description: "",
        contact_type: "customer",
      });
    }
    setErrors({});
  }, [contact, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    }

    // At least one contact method is required
    const hasEmail = formData.email && formData.email.trim();
    const hasPhone = formData.phone && formData.phone.trim();

    if (!hasEmail && !hasPhone) {
      newErrors.email = "Minimal harus ada email atau nomor telepon";
      newErrors.phone = "Minimal harus ada email atau nomor telepon";
    }

    // Validate email format if provided
    if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email!)) {
      newErrors.email = "Format email tidak valid";
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
      if (mode === "create") {
        await createMutation.mutateAsync(formData);
        toast.success("Kontak berhasil ditambahkan");
      } else if (contact) {
        // For update, use UpdateContact type
        const updateData: UpdateContact = {
          primary_name: formData.name,
          address: formData.address || null,
          description: formData.description || null,
          contact_type: formData.contact_type,
        };

        await updateMutation.mutateAsync({
          contactId: contact.id,
          data: updateData,
        });
        toast.success("Kontak berhasil diperbarui");
      }
      onClose();
    } catch (error) {
      toast.error(
        mode === "create"
          ? "Gagal menambahkan kontak"
          : "Gagal memperbarui kontak",
        error instanceof Error ? error.message : "Terjadi kesalahan"
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === "create" ? "Tambah Kontak" : "Edit Kontak"}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Masukkan nama kontak"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email{" "}
              <span className="text-gray-500 text-xs">
                (Minimal salah satu dari Email atau No. Telepon)
              </span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading || mode === "edit"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="email@example.com"
            />
            {mode === "edit" && (
              <p className="text-gray-500 text-xs mt-1">
                Email tidak dapat diubah. Gunakan fitur &quot;Tambah Email&quot;
                untuk menambah email baru.
              </p>
            )}
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon{" "}
              <span className="text-gray-500 text-xs">
                (Minimal salah satu dari Email atau No. Telepon)
              </span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading || mode === "edit"}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="081234567890"
            />
            {mode === "edit" && (
              <p className="text-gray-500 text-xs mt-1">
                Nomor telepon tidak dapat diubah. Gunakan fitur &quot;Tambah
                Nomor&quot; untuk menambah nomor baru.
              </p>
            )}
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Kontak <span className="text-red-500">*</span>
            </label>
            <select
              name="contact_type"
              value={formData.contact_type}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="customer">Customer</option>
              <option value="partner">Mitra</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat (Opsional)
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={isLoading}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Masukkan alamat lengkap"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Tambahkan catatan atau deskripsi"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Menyimpan..."
                  : "Memperbarui..."
                : mode === "create"
                ? "Tambah Kontak"
                : "Perbarui Kontak"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
