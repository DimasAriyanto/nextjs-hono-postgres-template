"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable, DataTableFacetedFilter } from "@/components/data-table";
import { createContactColumns } from "./contact-columns";
import { ContactFormModal } from "./contact-form-modal";
import { useToastActions } from "@/contexts/toast-context";
import { Table } from "@tanstack/react-table";
import { VendorContactTable, Contact } from "@/schemas";
import { useContacts, useDeleteContact } from "../hooks/use-contact";

export function VendorContactsListWrapper() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const toast = useToastActions();

  // Fetch contacts from API
  const { data: contactsData, isLoading } = useContacts({
    limit: 100, // Get all contacts for now
  });

  const contacts = contactsData?.data || [];

  const deleteMutation = useDeleteContact();

  const handleEdit = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setEditingContact(contact as Contact);
      setModalMode("edit");
      setShowModal(true);
    }
  };

  const handleCreate = () => {
    setEditingContact(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  const handleDeleteClick = (contactId: string) => {
    setShowDeleteConfirm(contactId);
  };

  const handleDeleteConfirm = async (contactId: string) => {
    try {
      await deleteMutation.mutateAsync(contactId);
      setShowDeleteConfirm(null);
      toast.success(
        "Kontak berhasil dihapus",
        "Data kontak telah dihapus dari sistem"
      );
    } catch (error) {
      toast.error(
        "Gagal menghapus kontak",
        error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus. Silakan coba lagi."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const columns = createContactColumns({
    onEdit: handleEdit,
    onDelete: handleDeleteClick,
  });

  const CreateButton = () => (
    <Button
      className="bg-blue-500 hover:bg-blue-600 text-white h-8"
      onClick={handleCreate}
    >
      <Plus className="w-4 h-4 mr-2" />
      Tambah Kontak
    </Button>
  );

  // Get unique contact types and sources
  const contactTypes = [
    { label: "Customer", value: "customer" },
    { label: "Mitra", value: "partner" },
  ];

  const sources = [
    { label: "Dari Booking", value: "booking" },
    { label: "Manual", value: "manual" },
  ];

  const FilterComp = ({ table }: { table: Table<VendorContactTable> }) => {
    return (
      <>
        <DataTableFacetedFilter
          column={table.getColumn("contact_type")}
          title="Tipe"
          options={contactTypes}
        />
        <DataTableFacetedFilter
          column={table.getColumn("first_contact_source")}
          title="Sumber"
          options={sources}
        />
      </>
    );
  };

  return (
    <>
      <main className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Kontak</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola daftar customer dan mitra bisnis Anda
          </p>
        </div>

        {/* Contacts Table */}
        <DataTable
          columns={columns}
          data={contacts}
          meta={{ limit: 10, total: contacts.length }}
          FilterComp={FilterComp}
          CreateComp={CreateButton}
          isError={false}
          isLoading={isLoading}
        />
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konfirmasi Hapus Kontak
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus kontak ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        contact={editingContact}
        mode={modalMode}
      />
    </>
  );
}