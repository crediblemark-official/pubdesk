import { invoke } from '@tauri-apps/api/core';
import { Book } from '../types/book.types';
import { Contact } from '../types/contact.types';
import { Service } from '../types/service.types';
import { File } from '../types/file.types';
import { Invoice } from '../types/invoice.types';

interface UseSyncStateProps {
  contacts: Contact[];
  loadContacts: () => Promise<void>;
  books: Book[];
  loadBooks: () => Promise<void>;
  services: Service[];
  loadServices: () => Promise<void>;
  files: File[];
  loadFiles: () => Promise<void>;
  invoices: Invoice[];
  loadInvoices: () => Promise<void>;
}

export function useSyncState({
  contacts,
  loadContacts,
  books,
  loadBooks,
  services,
  loadServices,
  files,
  loadFiles,
  invoices,
  loadInvoices
}: UseSyncStateProps) {
  
  const updateSyncStatus = async (tableName: string, id: number, syncStatus: string, cloudFileUrl?: string) => {
    try {
      await invoke('update_sync_status', {
        tableName,
        id,
        syncStatus,
        cloudFileUrl: cloudFileUrl || null
      });
      if (tableName === 'contacts') await loadContacts();
      else if (tableName === 'books') await loadBooks();
      else if (tableName === 'services') await loadServices();
      else if (tableName === 'files') await loadFiles();
      else if (tableName === 'invoices') await loadInvoices();
    } catch (error) {
      console.error(`Failed to update sync status for ${tableName} id ${id}:`, error);
    }
  };

  const syncAllDataToCloud = async (dataMaster: {
    penulis: any[];
    penerbit: any[];
    naskah: any[];
    tim: any[];
    legalitas: any[];
    services: any[];
    tasks: any[];
  }) => {
    const { googleAppsScriptService } = await import('../services/googleAppsScript');
    if (!googleAppsScriptService.isConfigured()) {
      return { success: false, message: 'Google Apps Script belum dikonfigurasi di Pengaturan!' };
    }

    try {
      // 1. Contacts
      if (contacts.length > 0) {
        const payload = contacts.map(c => ({
          id: c.id,
          name: c.name,
          wa_number: c.wa_number || '',
          email: c.email || '',
          address: c.address || '',
          province: c.province || '',
          city: c.city || '',
          job: c.job || '',
          institution: c.institution || '',
          data_source: c.data_source || '',
          email_valid: c.email_valid,
          wa_valid: c.wa_valid,
          followup_status: c.followup_status || '',
          notes: c.notes || '',
          type: c.type,
          created_at: c.created_at,
          updated_at: c.updated_at || c.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Contacts', payload);
        for (const c of contacts) {
          if (c.id) {
            await invoke('update_sync_status', { tableName: 'contacts', id: c.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
        await loadContacts();
      }

      // 2. Books
      if (books.length > 0) {
        const processedBooks = [];
        for (const b of books) {
          let currentCoverPath = b.cover_path || '';
          
          // Jika cover_path berupa gambar base64, unggah ke Google Drive (Covers folder) terlebih dahulu
          if (currentCoverPath.startsWith('data:')) {
            try {
              const match = currentCoverPath.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
              if (match) {
                const mimeType = match[1];
                const base64Data = match[2];
                const fileExt = mimeType.split('/')[1] || 'png';
                const fileName = `Cover-${b.id || 'new'}-${b.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
                
                console.log(`[Sync Books] Mengunggah cover base64 ke Google Drive untuk: ${b.title}`);
                const uploadResult = await googleAppsScriptService.uploadFileToCloud(
                  fileName,
                  base64Data,
                  'Covers',
                  mimeType
                );
                
                if (uploadResult && uploadResult.file_url) {
                  currentCoverPath = uploadResult.file_url;
                  
                  // Perbarui cover_path lokal di SQLite menjadi URL cloud
                  if (b.id) {
                    await invoke('update_book', {
                      book: {
                        ...b,
                        cover_path: currentCoverPath
                      }
                    });
                  }
                }
              }
            } catch (uploadErr) {
              console.error(`Gagal mengunggah cover untuk buku ${b.title}:`, uploadErr);
              // Lanjutkan sinkronisasi meskipun upload cover gagal
              currentCoverPath = '';
            }
          }
          
          processedBooks.push({
            id: b.id,
            title: b.title,
            isbn: b.isbn || '',
            regular_price: b.regular_price,
            po_price: b.po_price,
            weight_grams: b.weight_grams,
            author_id: b.author_id || '',
            cover_path: currentCoverPath,
            created_at: b.created_at || new Date().toISOString(),
            updated_at: b.updated_at || b.created_at || new Date().toISOString()
          });
        }

        await googleAppsScriptService.upsertRecordsToCloud('Books', processedBooks);
        for (const pb of processedBooks) {
          if (pb.id) {
            await invoke('update_sync_status', { 
              tableName: 'books', 
              id: pb.id, 
              syncStatus: 'synced', 
              cloudFileUrl: pb.cover_path || null 
            });
          }
        }
        await loadBooks();
      }

      // 3. Services
      if (services.length > 0) {
        const payload = services.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          description: s.description || '',
          category: s.category,
          created_at: s.created_at || new Date().toISOString(),
          updated_at: s.updated_at || s.created_at || new Date().toISOString()
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Services', payload);
        for (const s of services) {
          if (s.id) {
            await invoke('update_sync_status', { tableName: 'services', id: s.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
        await loadServices();
      }

      // 4. Files
      const cloudFiles = files.filter(f => f.path.startsWith('gdrive://') || f.path.startsWith('http://') || f.path.startsWith('https://'));
      if (cloudFiles.length > 0) {
        const payload = cloudFiles.map(f => ({
          id: f.id,
          path: f.path,
          filename: f.filename,
          type: f.type,
          project_id: f.project_id || '',
          status: f.status,
          version_label: f.version_label || '',
          last_modified: f.last_modified,
          modified_by: f.modified_by || '',
          is_readonly: f.is_readonly ? 1 : 0,
          description: f.description || '',
          responsible_parties: f.responsible_parties || '',
          created_at: f.created_at || f.last_modified,
          updated_at: f.updated_at || f.last_modified
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Files', payload);
        for (const f of cloudFiles) {
          if (f.id) {
            await invoke('update_sync_status', { tableName: 'files', id: f.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
        await loadFiles();
      }

      // 5. Invoices
      if (invoices.length > 0) {
        const payload = invoices.map(inv => ({
          id: inv.id,
          created_at: inv.created_at,
          customer_id: inv.customer_id || '',
          items_json: inv.items_json,
          shipping_cost: inv.shipping_cost,
          admin_fee: inv.admin_fee,
          total: inv.total,
          export_format: inv.export_format || '',
          file_path: inv.file_path || '',
          sync_status: 'synced',
          cloud_file_url: inv.cloud_file_url || ''
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Invoices', payload);
        for (const inv of invoices) {
          if (inv.id) {
            await invoke('update_sync_status', { tableName: 'invoices', id: inv.id, syncStatus: 'synced', cloudFileUrl: inv.cloud_file_url || null });
          }
        }
        await loadInvoices();
      }

      // 6. Penerbit
      if (dataMaster.penerbit.length > 0) {
        const payload = dataMaster.penerbit.map(p => ({
          id: p.id,
          name: p.name,
          city: p.city || '',
          instagram: p.instagram || '',
          facebook: p.facebook || '',
          email: p.email || '',
          wa_number: p.wa_number || '',
          linkedin: p.linkedin || '',
          twitter: p.twitter || '',
          tiktok: p.tiktok || '',
          wa_valid: p.wa_valid,
          email_valid: p.email_valid,
          cooperation_status: p.cooperation_status || 'Aktif',
          address: p.address || '',
          notes: p.notes || '',
          province: p.province || '',
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Penerbit', payload);
        for (const p of dataMaster.penerbit) {
          if (p.id) {
            await invoke('update_sync_status', { tableName: 'penerbit', id: p.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
      }

      // 7. Naskah
      if (dataMaster.naskah.length > 0) {
        const payload = dataMaster.naskah.map(n => ({
          id: n.id,
          naskah_id_code: n.naskah_id_code || '',
          title: n.title,
          penulis_id: n.penulis_id || '',
          penerbit_id: n.penerbit_id || '',
          package_type: n.package_type || '',
          order_type: n.order_type || '',
          copies: n.copies || 0,
          book_size: n.book_size || '',
          initial_request: n.initial_request || '',
          revised_request: n.revised_request || '',
          legal_type: n.legal_type || '',
          shipping_address: n.shipping_address || '',
          store_links: n.store_links || '',
          status: n.status,
          genre: n.genre || '',
          total_pages: n.total_pages || 0,
          synopsis: n.synopsis || '',
          assigned_team_ids: n.assigned_team_ids || '',
          created_at: n.created_at,
          updated_at: n.updated_at || n.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Naskah', payload);
        for (const n of dataMaster.naskah) {
          if (n.id) {
            await invoke('update_sync_status', { tableName: 'naskah', id: n.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
      }

      // 8. Tim
      if (dataMaster.tim.length > 0) {
        const payload = dataMaster.tim.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role,
          is_active: t.is_active,
          weekly_target: t.weekly_target || 0,
          notes: t.notes || '',
          department: t.department || '',
          pin: t.pin || '',
          created_at: t.created_at,
          updated_at: t.updated_at || t.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Tim', payload);
        for (const t of dataMaster.tim) {
          if (t.id) {
            await invoke('update_sync_status', { tableName: 'tim', id: t.id, syncStatus: 'synced', cloudFileUrl: null });
          }
        }
      }

      // 9. Legalitas
      if (dataMaster.legalitas.length > 0) {
        const payload = dataMaster.legalitas.map(l => ({
          id: l.id,
          naskah_id: l.naskah_id || '',
          judul_buku: l.judul_buku,
          nama_penulis: l.nama_penulis,
          tipe: l.tipe,
          tanggal_pengajuan: l.tanggal_pengajuan || '',
          keterangan: l.keterangan || '',
          status: l.status,
          nomor_dokumen: l.nomor_dokumen || '',
          tanggal_keluar: l.tanggal_keluar || '',
          tanggal_revisi: l.tanggal_revisi || '',
          pic_id: l.pic_id || '',
          rejection_reason: l.rejection_reason || '',
          proof_path_or_link: l.proof_path_or_link || '',
          created_at: l.created_at,
          updated_at: l.updated_at || l.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Legalitas', payload);
        for (const l of dataMaster.legalitas) {
          if (l.id) {
            await invoke('update_sync_status', { tableName: 'legalitas', id: l.id, syncStatus: 'synced', cloudFileUrl: l.proof_path_or_link || null });
          }
        }
      }

      // 10. Tasks
      if (dataMaster.tasks.length > 0) {
        const payload = dataMaster.tasks.map(t => ({
          id: t.id,
          naskah_id: t.naskah_id,
          step_name: t.step_name,
          step_order: t.step_order || 0,
          assigned_team_id: t.assigned_team_id || '',
          status: t.status,
          priority: t.priority || 'Normal',
          start_date: t.start_date || '',
          due_date: t.due_date || '',
          completed_date: t.completed_date || '',
          notes: t.notes || '',
          proof_path_or_link: t.proof_path_or_link || '',
          created_at: t.created_at,
          updated_at: t.updated_at || t.created_at
        }));
        await googleAppsScriptService.upsertRecordsToCloud('Tasks', payload);
        for (const t of dataMaster.tasks) {
          if (t.id) {
            await invoke('update_sync_status', { tableName: 'tasks', id: t.id, syncStatus: 'synced', cloudFileUrl: t.proof_path_or_link || null });
          }
        }
      }

      return { success: true, message: 'Seluruh data master dan operasional berhasil disinkronkan ke Cloud Google Sheets!' };
    } catch (err: any) {
      console.error('Error during bulk sync:', err);
      return { success: false, message: `Gagal sinkronisasi cloud: ${err.message || String(err)}` };
    }
  };

  return {
    updateSyncStatus,
    syncAllDataToCloud
  };
}
