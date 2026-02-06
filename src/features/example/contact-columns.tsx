'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Mail, Phone, MapPin, Tag } from 'lucide-react'
import { VendorContactTable } from '@/schemas'
import { DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface ContactColumnsProps {
  onEdit: (contactId: string) => void
  onDelete: (contactId: string) => void
}

export const createContactColumns = ({
  onEdit,
  onDelete,
}: ContactColumnsProps): ColumnDef<VendorContactTable>[] => [
  {
    accessorKey: 'primary_name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nama" />,
    cell: ({ row }) => {
      const contact = row.original
      return (
        <div>
          <div className="font-medium">{contact.primary_name}</div>
          {contact.names && contact.names.length > 1 && (
            <div className="text-xs text-gray-500 mt-0.5">
              +{contact.names.length - 1} variasi nama
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'primary_email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => {
      const contact = row.original
      const primaryEmail = contact.primary_email
      const totalEmails = contact.emails?.length || 0

      if (!primaryEmail) {
        return <span className="text-gray-400 text-xs">-</span>
      }

      return (
        <div>
          <a
            href={`mailto:${primaryEmail}`}
            className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
          >
            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate max-w-[200px]">{primaryEmail}</span>
          </a>
          {totalEmails > 1 && (
            <div className="text-xs text-gray-500 mt-0.5">
              +{totalEmails - 1} email lain
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'primary_phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title="No. Telepon" />,
    cell: ({ row }) => {
      const contact = row.original
      const primaryPhone = contact.primary_phone
      const totalPhones = contact.phones?.length || 0

      if (!primaryPhone) {
        return <span className="text-gray-400 text-xs">-</span>
      }

      return (
        <div>
          <a
            href={`tel:${primaryPhone}`}
            className="flex items-center text-green-600 hover:text-green-700 text-sm"
          >
            <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
            {primaryPhone}
          </a>
          {totalPhones > 1 && (
            <div className="text-xs text-gray-500 mt-0.5">
              +{totalPhones - 1} nomor lain
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'contact_type',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tipe" />,
    cell: ({ row }) => {
      const type = row.getValue('contact_type') as string
      return (
        <Badge
          variant={type === 'customer' ? 'default' : 'secondary'}
          className="text-xs"
        >
          {type === 'customer' ? 'Customer' : 'Mitra'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const contact = row.original
      const tags = contact.tags || []

      if (tags.length === 0) {
        return <span className="text-gray-400 text-xs">-</span>
      }

      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'total_bookings',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total Booking" />,
    cell: ({ row }) => {
      const contact = row.original
      return (
        <div className="text-sm">
          <span className="font-medium">{contact.total_bookings || 0}</span>
          {contact.last_booking_at && (
            <div className="text-xs text-gray-500 mt-0.5">
              Terakhir: {formatDate(contact.last_booking_at)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'first_contact_source',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Sumber" />,
    cell: ({ row }) => {
      const source = row.getValue('first_contact_source') as string
      return (
        <Badge
          variant={source === 'booking' ? 'outline' : 'secondary'}
          className="text-xs"
        >
          {source === 'booking' ? 'Dari Booking' : 'Manual'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const contact = row.original
      return (
        <div className="flex items-center justify-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(contact.id)}
            className="text-blue-500 hover:text-blue-700 h-8 w-8 p-0"
            title="Edit Kontak"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(contact.id)}
            className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
            title="Hapus Kontak"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
  },
]
