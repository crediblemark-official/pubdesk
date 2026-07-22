import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { useDataMasterContext } from '../../../contexts/DataMasterContext';
import { InvoiceItem } from '../../../types/invoice.types';
import { formatPrice, formatThousand, parseThousand } from '../../../utils/format';
import { evaluateItemFormula } from '../../../utils/invoice';
import { SmartRelationOption, Modal } from '@pubhub/shared-ui';
export const ItemsSection: React.FC = () => {
  const { services, books, showToast, addService, addBook, updateService, deleteService, updateBook, deleteBook, contacts, showConfirm } = useAppContext();
  const penulisList = useMemo(() => {
    return contacts.filter(c => c.type === 'penulis' || c.type === 'both');
  }, [contacts]);
  const { naskah } = useDataMasterContext();
  const {
    customer,
    items,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    calculateItemTotal,
    activeProfile,
    paymentStatus,
    paidAmount,
    setPaidAmount,
    paymentNotes,
    setPaymentNotes,
  } = useInvoiceContext();

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [customTitle, setCustomTitle] = useState('');
  const [selectedServiceIdState, setSelectedServiceIdState] = useState('');
  const [selectedBookIdState, setSelectedBookIdState] = useState('');
  const [selectedNaskahIdState, setSelectedNaskahIdState] = useState('');
  const [dynamicInputs, setDynamicInputs] = useState<Record<string, any>>({});
  const [createType, setCreateType] = useState<'service' | 'book'>('service');
  const [createFormData, setCreateFormData] = useState({
    name: '',
    price: 0,
    description: '',
    // book fields
    title: '',
    regular_price: 0,
    author_id: '',
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // State untuk dropdown kontekstual dinamis
  const [linkedPackageId, setLinkedPackageId] = useState<string>('');
  const [linkedBookId, setLinkedBookId] = useState<string>('');
  const [linkedPackageQuery, setLinkedPackageQuery] = useState<string>('');
  const [linkedBookQuery, setLinkedBookQuery] = useState<string>('');
  const [customLinkedPackageName, setCustomLinkedPackageName] = useState<string>('');
  const [customLinkedBookTitle, setCustomLinkedBookTitle] = useState<string>('');

  // State untuk form inline create saat linking
  const [linkedPackagePrice, setLinkedPackagePrice] = useState<number>(0);
  const [linkedPackageDesc, setLinkedPackageDesc] = useState<string>('');
  const [isForceCreatingLinkedPackage, setIsForceCreatingLinkedPackage] = useState<boolean>(false);

  const [linkedBookPrice, setLinkedBookPrice] = useState<number>(0);
  const [linkedBookAuthorSearch, setLinkedBookAuthorSearch] = useState<string>('');
  const [linkedBookAuthorId, setLinkedBookAuthorId] = useState<string>('');
  const [isForceCreatingLinkedBook, setIsForceCreatingLinkedBook] = useState<boolean>(false);

  // State untuk pencarian autocomplete Penulis
  const [authorSearchQuery, setAuthorSearchQuery] = useState<string>('');
  const [editMasterAuthorSearchQuery, setEditMasterAuthorSearchQuery] = useState<string>('');

  const matchedAuthors = useMemo(() => {
    if (!authorSearchQuery.trim()) return [];
    const q = authorSearchQuery.toLowerCase();
    return penulisList.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [authorSearchQuery, penulisList]);

  const matchedLinkedBookAuthors = useMemo(() => {
    if (!linkedBookAuthorSearch.trim()) return [];
    const q = linkedBookAuthorSearch.toLowerCase();
    return penulisList.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [linkedBookAuthorSearch, penulisList]);

  const selectedLinkedBookAuthor = useMemo(() => {
    return penulisList.find(p => String(p.id) === linkedBookAuthorId);
  }, [linkedBookAuthorId, penulisList]);

  const showLinkedBookAuthorDropdown = useMemo(() => {
    return linkedBookAuthorSearch.trim() !== '' && (!selectedLinkedBookAuthor || selectedLinkedBookAuthor.name !== linkedBookAuthorSearch);
  }, [linkedBookAuthorSearch, selectedLinkedBookAuthor]);

  const matchedEditMasterAuthors = useMemo(() => {
    if (!editMasterAuthorSearchQuery.trim()) return [];
    const q = editMasterAuthorSearchQuery.toLowerCase();
    return penulisList.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [editMasterAuthorSearchQuery, penulisList]);

  const selectedAuthor = useMemo(() => {
    return penulisList.find(p => String(p.id) === createFormData.author_id);
  }, [createFormData.author_id, penulisList]);

  const showAuthorDropdown = useMemo(() => {
    return authorSearchQuery.trim() !== '' && (!selectedAuthor || selectedAuthor.name !== authorSearchQuery);
  }, [authorSearchQuery, selectedAuthor]);



  const bookAndNaskahOptions = useMemo(() => {
    return [
      ...books.map(b => ({ id: `book-${b.id}`, title: b.title, type: 'book', original: b })),
      ...naskah.map(n => ({ id: `naskah-${n.id}`, title: n.title, type: 'naskah', original: n }))
    ];
  }, [books, naskah]);

  const matchedLinkedPackages = useMemo(() => {
    if (!linkedPackageQuery.trim()) return [];
    const q = linkedPackageQuery.toLowerCase();
    return services.filter(s => s.name.toLowerCase().includes(q)).slice(0, 5);
  }, [linkedPackageQuery, services]);

  const matchedLinkedBooks = useMemo(() => {
    if (!linkedBookQuery.trim()) return [];
    const q = linkedBookQuery.toLowerCase();
    return bookAndNaskahOptions.filter(b => b.title.toLowerCase().includes(q)).slice(0, 5);
  }, [linkedBookQuery, bookAndNaskahOptions]);

  // State untuk edit/ubah data master layanan & karya langsung dari dropdown
  const [showEditMasterModal, setShowEditMasterModal] = useState(false);
  const [editMasterType, setEditMasterType] = useState<'service' | 'book'>('service');
  const [editMasterData, setEditMasterData] = useState({
    id: 0,
    name: '',
    price: 0,
    description: '',
    author_id: '',
  });

  const selectedEditMasterAuthor = useMemo(() => {
    return penulisList.find(p => String(p.id) === editMasterData.author_id);
  }, [editMasterData.author_id, penulisList]);

  const showEditMasterAuthorDropdown = useMemo(() => {
    return editMasterAuthorSearchQuery.trim() !== '' && (!selectedEditMasterAuthor || selectedEditMasterAuthor.name !== editMasterAuthorSearchQuery);
  }, [editMasterAuthorSearchQuery, selectedEditMasterAuthor]);


  const [titleOrder, setTitleOrder] = useState<'service_first' | 'book_first'>('service_first');

  const formatTitleOrder = (pkgName: string, bookTitle: string, order: 'service_first' | 'book_first' = titleOrder) => {
    const p = pkgName.trim();
    const b = bookTitle.trim();
    if (p && b) {
      return order === 'service_first' ? `${p} - ${b}` : `${b} - ${p}`;
    }
    return p || b || '';
  };

  const toggleTitleOrder = () => {
    const nextOrder = titleOrder === 'service_first' ? 'book_first' : 'service_first';
    setTitleOrder(nextOrder);
    setCreateType(nextOrder === 'service_first' ? 'service' : 'book');

    let pkgName = '';
    if (selectedServiceIdState) {
      const s = services.find(srv => srv.id === parseInt(selectedServiceIdState));
      if (s) pkgName = s.name;
    } else if (linkedPackageId) {
      const s = services.find(srv => String(srv.id) === linkedPackageId);
      if (s) pkgName = s.name;
    }

    let bookTitle = '';
    if (selectedBookIdState) {
      const b = books.find(bk => bk.id === parseInt(selectedBookIdState));
      if (b) bookTitle = b.title;
    } else if (selectedNaskahIdState) {
      const n = naskah.find(nk => nk.id === parseInt(selectedNaskahIdState));
      if (n) bookTitle = n.title;
    } else if (linkedBookId) {
      if (linkedBookId.startsWith('book-')) {
        const b = books.find(bk => bk.id === parseInt(linkedBookId.replace('book-', '')));
        if (b) bookTitle = b.title;
      } else if (linkedBookId.startsWith('naskah-')) {
        const n = naskah.find(nk => nk.id === parseInt(linkedBookId.replace('naskah-', '')));
        if (n) bookTitle = n.title;
      }
    }

    if (pkgName || bookTitle) {
      setCustomTitle(formatTitleOrder(pkgName, bookTitle, nextOrder));
    }
  };

  const handleLinkPackage = (serviceId: string) => {
    setLinkedPackageId(serviceId);

    let bookTitle = '';
    if (selectedBookIdState) {
      const book = books.find(b => b.id === parseInt(selectedBookIdState));
      if (book) bookTitle = book.title;
    } else if (selectedNaskahIdState) {
      const n = naskah.find(nk => nk.id === parseInt(selectedNaskahIdState));
      if (n) bookTitle = n.title;
    }

    if (!serviceId) {
      let originalPrice = 0;
      if (selectedBookIdState) {
        const book = books.find(b => b.id === parseInt(selectedBookIdState));
        if (book) originalPrice = book.regular_price;
      }
      setCustomTitle(bookTitle);
      setDynamicInputs(prev => ({
        ...prev,
        price: originalPrice,
        package_name: '',
      }));
      return;
    }

    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setCustomTitle(formatTitleOrder(service.name, bookTitle, titleOrder));
      setDynamicInputs(prev => ({
        ...prev,
        price: service.price,
        package_name: service.name,
      }));
    }
  };

  const handleLinkBook = (id: string) => {
    setLinkedBookId(id);

    let packageName = '';
    if (selectedServiceIdState) {
      const service = services.find(s => s.id === parseInt(selectedServiceIdState));
      if (service) packageName = service.name;
    }

    if (!id) {
      setCustomTitle(packageName);
      setDynamicInputs(prev => ({
        ...prev,
        pages: '',
        paper_type: '',
        copyright_holder: customer.name || '',
      }));
      return;
    }

    if (id.startsWith('book-')) {
      const bookId = parseInt(id.replace('book-', ''));
      const book = books.find(b => b.id === bookId);
      if (book) {
        const bookAuthorContact = contacts.find(c => c.id === book.author_id);
        setCustomTitle(formatTitleOrder(packageName, book.title, titleOrder));
        setDynamicInputs(prev => ({
          ...prev,
          pages: '',
          paper_type: '',
          copyright_holder: bookAuthorContact?.name || customer.name || '',
        }));
      }
    } else if (id.startsWith('naskah-')) {
      const naskahId = parseInt(id.replace('naskah-', ''));
      const n = naskah.find(nk => nk.id === naskahId);
      if (n) {
        const penulisContact = contacts.find(c => c.id === n.penulis_id);
        setCustomTitle(formatTitleOrder(packageName, n.title, titleOrder));
        setDynamicInputs(prev => ({
          ...prev,
          pages: n.total_pages ? String(n.total_pages) : '',
          paper_type: n.legal_type || '',
          copyright_holder: penulisContact?.name || customer.name || '',
        }));
      }
    }
  };

  const handleCreateLinkedPackage = async () => {
    if (isSaving) return;
    if (!linkedPackageQuery.trim()) {
      showToast("Nama paket layanan harus diisi!", "error");
      return;
    }
    setIsSaving(true);
    try {
      const newServiceId = await addService({
        name: linkedPackageQuery.trim(),
        price: linkedPackagePrice,
        description: linkedPackageDesc.trim(),
        category: 'umum',
      });

      handleLinkPackage(String(newServiceId));
      setLinkedPackageQuery('');
      setLinkedPackagePrice(0);
      setLinkedPackageDesc('');
      setIsForceCreatingLinkedPackage(false);
      showToast("Layanan paket berhasil ditambahkan & dihubungkan!", "success");
    } catch (err) {
      console.error("Gagal menambahkan layanan paket baru:", err);
      showToast("Gagal menambahkan layanan paket baru", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLinkedBook = async () => {
    if (isSaving) return;
    if (!linkedBookQuery.trim()) {
      showToast("Judul karya harus diisi!", "error");
      return;
    }
    setIsSaving(true);
    try {
      const newBookId = await addBook({
        title: linkedBookQuery.trim(),
        regular_price: linkedBookPrice,
        po_price: linkedBookPrice,
        weight_grams: 0,
        author_id: linkedBookAuthorId ? parseInt(linkedBookAuthorId) : undefined,
      });

      handleLinkBook(`book-${newBookId}`);
      setLinkedBookQuery('');
      setLinkedBookPrice(0);
      setLinkedBookAuthorSearch('');
      setLinkedBookAuthorId('');
      setIsForceCreatingLinkedBook(false);
      showToast("Karya berhasil ditambahkan & dihubungkan!", "success");
    } catch (err) {
      console.error("Gagal menambahkan karya baru:", err);
      showToast("Gagal menambahkan karya baru", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateItem = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (createType === 'service') {
        if (!createFormData.name.trim()) {
          showToast("Nama layanan harus diisi!", "error");
          return;
        }
        try {
          const newServiceId = await addService({
            name: createFormData.name.trim(),
            price: createFormData.price,
            description: createFormData.description.trim(),
            category: 'umum',
          });

          setCustomTitle(createFormData.name.trim());
          setSelectedServiceIdState(String(newServiceId));
          setSelectedBookIdState('');
          setDynamicInputs(prev => ({ ...prev, price: createFormData.price }));
          showToast("Layanan berhasil ditambahkan!", "success");
        } catch (err) {
          console.error("Gagal menambahkan layanan baru:", err);
          showToast("Gagal menambahkan layanan baru", "error");
          return;
        }
      } else {
        if (!createFormData.title.trim()) {
          showToast("Judul karya harus diisi!", "error");
          return;
        }
        try {
          const newBookId = await addBook({
            title: createFormData.title.trim(),
            regular_price: createFormData.regular_price,
            po_price: createFormData.regular_price,
            weight_grams: 0,
            author_id: createFormData.author_id ? parseInt(createFormData.author_id) : undefined,
          });

          setCustomTitle(createFormData.title.trim());
          setSelectedBookIdState(String(newBookId));
          setSelectedServiceIdState('');
          setDynamicInputs(prev => ({ ...prev, price: createFormData.regular_price }));
          showToast("Karya berhasil ditambahkan!", "success");
        } catch (err) {
          console.error("Gagal menambahkan karya baru:", err);
          showToast("Gagal menambahkan karya baru", "error");
          return;
        }
      }

      // Reset form
      setCreateFormData({
        name: '',
        price: 0,
        description: '',
        title: '',
        regular_price: 0,
        author_id: '',
      });
      setAuthorSearchQuery('');
    } finally {
      setIsSaving(false);
    }
  };

  const allItemOptions: SmartRelationOption[] = useMemo(() => {
    return [
      ...services.map((s) => ({
        value: `service-${s.id}`,
        label: `${s.name} [Layanan]`,
        name: s.name,
        price: s.price,
        isBook: false,
        isNaskah: false,
        source: 'Layanan',
        // Extra fields untuk auto-fill form
        _autoFill: {
          price: s.price,
        },
      })),
      ...books.map((b) => ({
        value: `book-${b.id}`,
        label: `${b.title} [Karya]`,
        name: b.title,
        price: b.regular_price,
        isBook: true,
        isNaskah: false,
        source: 'Karya',
        // Extra fields untuk auto-fill form
        _autoFill: {
          price: b.regular_price,
        },
      })),
      ...naskah.map((n) => {
        // Cari penulis dari daftar kontak berdasarkan penulis_id
        const penulisContact = contacts.find(c => c.id === n.penulis_id);
        return {
          value: `naskah-${n.id}`,
          label: `${n.title} [Naskah]`,
          name: n.title,
          price: 0,
          isBook: false,
          isNaskah: true,
          source: 'Naskah',
          // Extra fields untuk auto-fill form
          _autoFill: {
            price: 0,
            // Kolom halaman — dari total_pages naskah
            pages: n.total_pages ? String(n.total_pages) : '',
            // Kolom jenis naskah — dari legal_type
            paper_type: n.legal_type || '',
            // Kolom jumlah cetak — dari copies naskah jika ada
            quantity: n.copies || 1,
            // Kolom copyright_holder — nama penulis
            copyright_holder: penulisContact?.name || '',
          },
        };
      }),
    ];
  }, [services, books, naskah, contacts]);

  const selectedValue = useMemo(() => {
    if (selectedServiceIdState) return `service-${selectedServiceIdState}`;
    if (selectedBookIdState) return `book-${selectedBookIdState}`;
    if (selectedNaskahIdState) return `naskah-${selectedNaskahIdState}`;
    if (customTitle) {
      const found = allItemOptions.find(o => (o as any).name?.toLowerCase() === customTitle.trim().toLowerCase());
      return found ? found.value : '';
    }
    return '';
  }, [selectedServiceIdState, selectedBookIdState, selectedNaskahIdState, customTitle, allItemOptions]);

  // Matched items dari DB berdasarkan query yang diketik di form create (pencarian universal)
  const searchQuery = (createFormData.name || createFormData.title);
  const matchedItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allItemOptions
      .filter(o => (o as any).name?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, allItemOptions]);

  const hasMatches = matchedItems.length > 0;

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [matchedItems]);

  const handleSelect = (value: string, option?: SmartRelationOption) => {
    if (!option) {
      setCustomTitle(value);
      setSelectedServiceIdState('');
      setSelectedBookIdState('');
      setSelectedNaskahIdState('');
      return;
    }

    setCustomTitle((option as any).name || option.label);
    if ((option as any).isNaskah) {
      setSelectedNaskahIdState(value.replace('naskah-', ''));
      setSelectedBookIdState('');
      setSelectedServiceIdState('');
    } else if ((option as any).isBook) {
      setSelectedBookIdState(value.replace('book-', ''));
      setSelectedServiceIdState('');
      setSelectedNaskahIdState('');
    } else {
      setSelectedServiceIdState(value.replace('service-', ''));
      setSelectedBookIdState('');
      setSelectedNaskahIdState('');
    }

    // Auto-fill semua field yang tersedia dari opsi yang dipilih
    const autoFill = (option as any)._autoFill || {};
    setDynamicInputs((prev) => ({
      ...prev,
      // Spread semua field dari autoFill, hanya isi jika belum diisi atau nilai berbeda
      // Filter field kosong supaya tidak menimpa nilai yang sudah diisi user
      ...Object.fromEntries(
        Object.entries(autoFill).filter(([_, v]) => v !== '' && v !== 0 && v !== undefined && v !== null)
      ),
      // price selalu dioverride dari pilihan
      price: autoFill.price ?? ((option as any).price || 0),
    }));
  };

  // Dynamically set default values when activeProfile changes
  useEffect(() => {
    if (!activeProfile?.tableColumns) return;

    const initialInputs: Record<string, any> = {};
    activeProfile.tableColumns.forEach(col => {
      if (col.key === 'item_title') return;

      let defVal: any = '';
      if (col.key === 'quantity') {
        defVal = 1;
      } else if (col.key === 'price') {
        defVal = 0;
      } else if (col.key === 'pages') {
        defVal = '';
      } else if (col.key === 'paper_type') {
        defVal = '';
      } else if (col.key === 'item_shipping_cost') {
        defVal = 0;
      } else if (col.key === 'package_name') {
        defVal = '';
      } else if (col.key === 'copyright_holder') {
        defVal = customer.name || '';
      }
      initialInputs[col.key] = defVal;
    });

    setDynamicInputs(initialInputs);
    setCustomTitle('');
  }, [activeProfile, customer.name]);

  // Dapatkan daftar field input yang diperlukan untuk profil aktif
  const getRequiredFields = () => {
    if (!activeProfile?.tableColumns) return [];

    const fieldsMap = new Map<string, { key: string; label: string; type: 'text' | 'number' | 'currency' }>();

    activeProfile.tableColumns.forEach(col => {
      if (col.type !== 'formula') {
        fieldsMap.set(col.key, {
          key: col.key,
          label: col.label,
          type: col.type as 'text' | 'number' | 'currency'
        });
      } else if (col.formula) {
        const tokenRegex = /\{([^}]+)\}/g;
        let match;
        while ((match = tokenRegex.exec(col.formula)) !== null) {
          const tokenKey = match[1];
          if (!fieldsMap.has(tokenKey)) {
            let label = tokenKey;
            let type: 'text' | 'number' | 'currency' = 'text';

            if (tokenKey === 'quantity') {
              label = 'Jumlah';
              type = 'number';
            } else if (tokenKey === 'price') {
              label = 'Harga';
              type = 'currency';
            } else if (tokenKey === 'item_shipping_cost') {
              label = 'Ongkos Kirim';
              type = 'currency';
            } else if (tokenKey === 'package_name') {
              label = 'Nama Paket';
              type = 'text';
            } else if (tokenKey === 'pages') {
              label = 'Halaman';
              type = 'text';
            } else if (tokenKey === 'paper_type') {
              label = 'Jenis Naskah';
              type = 'text';
            } else if (tokenKey === 'copyright_holder') {
              label = 'Pemegang Hak Cipta';
              type = 'text';
            }

            fieldsMap.set(tokenKey, { key: tokenKey, label, type });
          }
        }
      }
    });

    if (!fieldsMap.has('discount')) {
      fieldsMap.set('discount', { key: 'discount', label: 'Diskon', type: 'currency' });
    }

    const fields = Array.from(fieldsMap.values());
    const titleField = fields.find(f => f.key === 'item_title');
    const priceField = fields.find(f => f.key === 'price');
    const qtyField = fields.find(f => f.key === 'quantity');
    const discountField = fields.find(f => f.key === 'discount');

    const otherFields = fields.filter(f => f.key !== 'item_title' && f.key !== 'price' && f.key !== 'quantity' && f.key !== 'discount');

    const sortedFields = [];
    if (titleField) sortedFields.push(titleField);
    sortedFields.push(...otherFields);
    if (qtyField) sortedFields.push(qtyField);
    if (priceField) sortedFields.push(priceField);
    if (discountField) sortedFields.push(discountField);

    return sortedFields;
  };

  const handleEditMasterOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value.startsWith('service-')) {
      const id = parseInt(value.replace('service-', ''));
      const s = services.find(item => item.id === id);
      if (s) {
        setEditMasterType('service');
        setEditMasterData({
          id: s.id || 0,
          name: s.name,
          price: s.price,
          description: s.description || '',
          author_id: '',
        });
        setShowEditMasterModal(true);
      }
    } else if (value.startsWith('book-')) {
      const id = parseInt(value.replace('book-', ''));
      const b = books.find(item => item.id === id);
      if (b) {
        setEditMasterType('book');
        const author = contacts.find(c => c.id === b.author_id);
        setEditMasterAuthorSearchQuery(author?.name || '');
        setEditMasterData({
          id: b.id || 0,
          name: b.title,
          price: b.regular_price,
          description: '',
          author_id: b.author_id ? String(b.author_id) : '',
        });
        setShowEditMasterModal(true);
      }
    }
  };

  const handleDeleteMasterOption = (value: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (value.startsWith('service-')) {
      const id = parseInt(value.replace('service-', ''));
      const s = services.find(item => item.id === id);
      if (s) {
        showConfirm({
          title: 'Hapus Layanan',
          message: `Apakah Anda yakin ingin menghapus layanan "${s.name}" dari master?`,
          confirmText: 'Hapus',
          type: 'danger',
          onConfirm: async () => {
            try {
              await deleteService(id);
              showToast('Layanan berhasil dihapus dari master!', 'success');
            } catch {
              showToast('Gagal menghapus layanan', 'error');
            }
          }
        });
      }
    } else if (value.startsWith('book-')) {
      const id = parseInt(value.replace('book-', ''));
      const b = books.find(item => item.id === id);
      if (b) {
        showConfirm({
          title: 'Hapus Karya / Buku',
          message: `Apakah Anda yakin ingin menghapus karya "${b.title}" dari master?`,
          confirmText: 'Hapus',
          type: 'danger',
          onConfirm: async () => {
            try {
              await deleteBook(id);
              showToast('Karya berhasil dihapus dari master!', 'success');
            } catch {
              showToast('Gagal menghapus karya', 'error');
            }
          }
        });
      }
    }
  };

  const handleSaveMasterEdit = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (editMasterType === 'service') {
        if (!editMasterData.name.trim()) {
          showToast('Nama layanan tidak boleh kosong!', 'error');
          return;
        }
        try {
          const s = services.find(item => item.id === editMasterData.id);
          if (s) {
            await updateService({
              ...s,
              name: editMasterData.name.trim(),
              price: editMasterData.price,
              description: editMasterData.description,
            });
            showToast('Data master layanan berhasil diperbarui!', 'success');
            setShowEditMasterModal(false);
          }
        } catch {
          showToast('Gagal memperbarui data master layanan', 'error');
        }
      } else {
        if (!editMasterData.name.trim()) {
          showToast('Judul karya tidak boleh kosong!', 'error');
          return;
        }
        try {
          const b = books.find(item => item.id === editMasterData.id);
          if (b) {
            await updateBook({
              ...b,
              title: editMasterData.name.trim(),
              regular_price: editMasterData.price,
              author_id: editMasterData.author_id ? parseInt(editMasterData.author_id) : undefined,
            });
            showToast('Data master karya berhasil diperbarui!', 'success');
            setShowEditMasterModal(false);
          }
        } catch {
          showToast('Gagal memperbarui data master karya', 'error');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEdit = (index: number) => {
    const item = items[index];
    setEditingIndex(index);
    setCustomTitle(item.item_title);

    let isLinkedPackage = false;
    let isLinkedBook = false;

    // Cari relasi
    if (item.service_id) {
      // Jika ini ditambahkan sebagai Layanan
      setSelectedServiceIdState(String(item.service_id));
      setSelectedBookIdState('');
      setSelectedNaskahIdState('');

      if (item.book_id) {
        setLinkedBookId(`book-${item.book_id}`);
        isLinkedBook = true;
      } else if (item.naskah_id) {
        setLinkedBookId(`naskah-${item.naskah_id}`);
        isLinkedBook = true;
      }
    } else if (item.book_id && !item.package_name) {
      // Jika Buku murni tanpa link package
      setSelectedBookIdState(String(item.book_id));
      setSelectedServiceIdState('');
      setSelectedNaskahIdState('');
    } else if (item.naskah_id && !item.package_name) {
      // Jika Naskah murni tanpa link package
      setSelectedNaskahIdState(String(item.naskah_id));
      setSelectedBookIdState('');
      setSelectedServiceIdState('');
    } else {
      // Fallback lama / data lama
      const matchedService = services.find(s => s.name === item.item_title || item.item_title.endsWith(` - ${s.name}`));
      if (matchedService) {
        setSelectedServiceIdState(String(matchedService.id));
        setSelectedBookIdState('');
        setSelectedNaskahIdState('');
        
        if (item.book_id) {
          setLinkedBookId(`book-${item.book_id}`);
          isLinkedBook = true;
        } else if (item.naskah_id) {
          setLinkedBookId(`naskah-${item.naskah_id}`);
          isLinkedBook = true;
        }
      } else {
        if (item.book_id) {
          setSelectedBookIdState(String(item.book_id));
          setSelectedServiceIdState('');
          setSelectedNaskahIdState('');
          if (item.package_name) {
            const service = services.find(s => s.name === item.package_name);
            if (service) {
              setLinkedPackageId(String(service.id));
              isLinkedPackage = true;
            }
          }
        } else if (item.naskah_id) {
          setSelectedNaskahIdState(String(item.naskah_id));
          setSelectedBookIdState('');
          setSelectedServiceIdState('');
          if (item.package_name) {
            const service = services.find(s => s.name === item.package_name);
            if (service) {
              setLinkedPackageId(String(service.id));
              isLinkedPackage = true;
            }
          }
        }
      }
    }

    if (!isLinkedPackage) setLinkedPackageId('');
    if (!isLinkedBook) setLinkedBookId('');
    setLinkedPackageQuery('');
    setLinkedBookQuery('');

    // Muat dynamic inputs
    const inputs: Record<string, any> = {};
    activeProfile?.tableColumns?.forEach(col => {
      if (col.key in item) {
        inputs[col.key] = item[col.key];
      }
    });
    setDynamicInputs(inputs);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    let finalTitle = customTitle.trim();
    let finalPrice = parseFloat(dynamicInputs['price']) || 0;
    const finalQty = parseInt(dynamicInputs['quantity']) || 1;

    let finalBookId = selectedBookIdState ? parseInt(selectedBookIdState) : 0;
    let finalNaskahId = selectedNaskahIdState ? parseInt(selectedNaskahIdState) : undefined;

    if (selectedServiceIdState) {
      const service = services.find((s) => s.id === parseInt(selectedServiceIdState));
      if (service) {
        if (!finalTitle) finalTitle = service.name;
        if (finalPrice === 0) finalPrice = service.price;
      }
      
      // Jika di Layanan dihubungkan ke Buku
      if (linkedBookId) {
        if (linkedBookId.startsWith('book-')) {
          finalBookId = parseInt(linkedBookId.replace('book-', ''));
        } else if (linkedBookId.startsWith('naskah-')) {
          finalNaskahId = parseInt(linkedBookId.replace('naskah-', ''));
        }
      }
    } else if (selectedBookIdState) {
      const book = books.find((b) => b.id === parseInt(selectedBookIdState));
      if (book) {
        if (!finalTitle) finalTitle = book.title;
        if (finalPrice === 0) finalPrice = book.regular_price;
      }
    }

    if (!finalTitle) {
      showToast('Judul buku atau layanan harus diisi!', 'error');
      return;
    }

    const updatedItem: Partial<InvoiceItem> = {
      service_id: selectedServiceIdState ? parseInt(selectedServiceIdState) : undefined,
      book_id: finalBookId,
      naskah_id: finalNaskahId,
      item_title: finalTitle,
      quantity: finalQty,
      price: finalPrice,
      discountType: dynamicInputs.discountType || 'fixed',
    };

    activeProfile?.tableColumns?.forEach(col => {
      if (col.key !== 'item_title' && col.key !== 'price' && col.key !== 'quantity' && col.key !== 'total') {
        updatedItem[col.key] = dynamicInputs[col.key];
      }
    });

    updateItem(editingIndex, updatedItem);
    showToast('Item berhasil diperbarui!', 'success');
    handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCustomTitle('');
    setSelectedServiceIdState('');
    setSelectedBookIdState('');
    setSelectedNaskahIdState('');
    setLinkedPackageId('');
    setLinkedBookId('');
    setLinkedPackageQuery('');
    setLinkedBookQuery('');

    if (activeProfile?.tableColumns) {
      const initialInputs: Record<string, any> = {};
      activeProfile.tableColumns.forEach(col => {
        if (col.key === 'item_title') return;
        let defVal: any = '';
        if (col.key === 'quantity') defVal = 1;
        else if (col.key === 'price') defVal = 0;
        else if (col.key === 'copyright_holder') defVal = customer.name || '';
        initialInputs[col.key] = defVal;
      });
      setDynamicInputs(initialInputs);
    }
  };

  const handleAddItem = () => {
    let finalTitle = customTitle.trim();
    let finalPrice = parseFloat(dynamicInputs['price']) || 0;
    const finalQty = parseInt(dynamicInputs['quantity']) || 1;

    let finalBookId = selectedBookIdState ? parseInt(selectedBookIdState) : 0;
    let finalNaskahId = selectedNaskahIdState ? parseInt(selectedNaskahIdState) : undefined;

    if (selectedServiceIdState) {
      const service = services.find((s) => s.id === parseInt(selectedServiceIdState));
      if (service) {
        if (!finalTitle) finalTitle = service.name;
        if (finalPrice === 0) {
          finalPrice = service.price;
        }
      }

      // Jika di Layanan dihubungkan ke Buku
      if (linkedBookId) {
        if (linkedBookId.startsWith('book-')) {
          finalBookId = parseInt(linkedBookId.replace('book-', ''));
        } else if (linkedBookId.startsWith('naskah-')) {
          finalNaskahId = parseInt(linkedBookId.replace('naskah-', ''));
        }
      }
    } else if (selectedBookIdState) {
      const book = books.find((b) => b.id === parseInt(selectedBookIdState));
      if (book) {
        if (!finalTitle) finalTitle = book.title;
        if (finalPrice === 0) {
          finalPrice = book.regular_price;
        }
      }
    } else if (selectedNaskahIdState) {
      const n = naskah.find((nk) => nk.id === parseInt(selectedNaskahIdState));
      if (n) {
        if (!finalTitle) finalTitle = n.title;
      }
    }

    if (!finalTitle) {
      showToast('Judul buku atau layanan harus diisi!', 'error');
      return;
    }

    const newItem: InvoiceItem = {
      service_id: selectedServiceIdState ? parseInt(selectedServiceIdState) : undefined,
      book_id: finalBookId,
      naskah_id: finalNaskahId,
      item_title: finalTitle,
      quantity: finalQty,
      price: finalPrice,
      discount: 0,
      ...dynamicInputs
    };

    addItem(newItem);

    // Reset form item
    setCustomTitle('');
    setSelectedServiceIdState('');
    setSelectedBookIdState('');
    setSelectedNaskahIdState('');
    setLinkedPackageId('');
    setLinkedBookId('');
    setLinkedPackageQuery('');
    setLinkedBookQuery('');

    if (activeProfile?.tableColumns) {
      const initialInputs: Record<string, any> = {};
      activeProfile.tableColumns.forEach(col => {
        if (col.key === 'item_title') return;

        let defVal: any = '';
        if (col.key === 'quantity') {
          defVal = 1;
        } else if (col.key === 'price') {
          defVal = 0;
        } else if (col.key === 'pages') {
          defVal = '';
        } else if (col.key === 'paper_type') {
          defVal = '';
        } else if (col.key === 'item_shipping_cost') {
          defVal = 0;
        } else if (col.key === 'package_name') {
          defVal = '';
        } else if (col.key === 'copyright_holder') {
          defVal = customer.name || '';
        }
        initialInputs[col.key] = defVal;
      });
      setDynamicInputs(initialInputs);
    }
  };

  return (
    <>
      {/* === Unified Search + Create Form === */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>

        {/* Item sudah dipilih — tampilkan state terpilih */}
        {selectedValue ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              height: '42px',
              boxSizing: 'border-box',
            }}>
              <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600' }}>✓</span>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>
                {allItemOptions.find(o => o.value === selectedValue)?.name ?? customTitle}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedServiceIdState('');
                  setSelectedBookIdState('');
                  setSelectedNaskahIdState('');
                  setCustomTitle('');
                  setLinkedPackageId('');
                  setLinkedBookId('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  borderRadius: '5px',
                }}
              >
                × Ganti
              </button>
            </div>

            {/* === Dropdown Kontekstual Dinamis === */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', marginTop: '4px' }}>
              {/* Skenario A: Buku/Naskah terpilih -> Tampilkan search Paket Layanan */}
              {(selectedBookIdState || selectedNaskahIdState) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px', position: 'relative' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Paket Layanan / Penerbitan:
                  </label>
                  {linkedPackageId ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      height: '42px',
                      boxSizing: 'border-box',
                      background: 'var(--bg-panel)'
                    }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>
                        {linkedPackageId.startsWith('custom-')
                          ? (customLinkedPackageName || linkedPackageId.replace('custom-', ''))
                          : (services.find(s => String(s.id) === linkedPackageId)?.name || linkedPackageId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleLinkPackage('');
                          setCustomLinkedPackageName('');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        × Lepas
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                      {/* Input Nama Paket */}
                      <div style={{ flex: 2, minWidth: '180px', position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Paket Baru — ketik untuk cari atau buat baru..."
                          value={linkedPackageQuery}
                          onChange={(e) => {
                            setLinkedPackageQuery(e.target.value);
                            if (isForceCreatingLinkedPackage) setIsForceCreatingLinkedPackage(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            height: '42px',
                            boxSizing: 'border-box'
                          }}
                        />

                        {/* Dropdown Overlay ala Image 1 */}
                        {matchedLinkedPackages.length > 0 && !isForceCreatingLinkedPackage && (
                          <div style={{
                            position: 'absolute',
                            top: '46px',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            zIndex: 50,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                          }}>
                            {matchedLinkedPackages.map((s) => (
                              <div
                                key={s.id}
                                onClick={() => {
                                  handleLinkPackage(String(s.id));
                                  setLinkedPackageQuery('');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderBottom: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: 'var(--text-primary)',
                                  transition: 'background 0.2s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>💼</span>
                                  <span style={{ fontWeight: '500' }}>{s.name}</span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>[Layanan]</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={(e) => handleEditMasterOption(`service-${s.id}`, e)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                                    title="Edit Master"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteMasterOption(`service-${s.id}`, e)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                                    title="Hapus Master"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div
                              onClick={() => setIsForceCreatingLinkedPackage(true)}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--accent)',
                                background: 'var(--bg-card)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>+ Buat Layanan Paket Baru "{linkedPackageQuery}"</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input Extra Fields + Simpan Red Button ala Image 4 saat no matches / force create / typing new */}
                      {(matchedLinkedPackages.length === 0 || isForceCreatingLinkedPackage) && linkedPackageQuery.trim() !== '' && (
                        <>
                          <input
                            type="text"
                            placeholder="Harga Satuan (Rp)"
                            value={formatThousand(linkedPackagePrice)}
                            onChange={(e) => setLinkedPackagePrice(parseThousand(e.target.value))}
                            style={{
                              flex: 1, minWidth: '120px',
                              padding: '10px 14px',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              fontSize: '14px',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              height: '42px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Deskripsi (opsional)"
                            value={linkedPackageDesc}
                            onChange={(e) => setLinkedPackageDesc(e.target.value)}
                            style={{
                              flex: 2, minWidth: '140px',
                              padding: '10px 14px',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              fontSize: '14px',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              height: '42px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleCreateLinkedPackage}
                            disabled={isSaving}
                            style={{
                              padding: '10px 18px',
                              fontSize: '14px',
                              fontWeight: '600',
                              borderRadius: '8px',
                              background: '#c5221f',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxSizing: 'border-box'
                            }}
                          >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Skenario B: Layanan terpilih -> Tampilkan search Hubungkan Buku */}
              {selectedServiceIdState && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '200px', position: 'relative' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Hubungkan dengan Buku / Karya:
                  </label>
                  {linkedBookId ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      height: '42px',
                      boxSizing: 'border-box',
                      background: 'var(--bg-panel)'
                    }}>
                      <span style={{ fontSize: '14px', color: 'var(--text-primary)', flex: 1 }}>
                        {linkedBookId.startsWith('custom-')
                          ? (customLinkedBookTitle || linkedBookId.replace('custom-', ''))
                          : (bookAndNaskahOptions.find(b => b.id === linkedBookId)?.title || linkedBookId)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleLinkBook('');
                          setCustomLinkedBookTitle('');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        × Lepas
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                      {/* Input Judul Karya */}
                      <div style={{ flex: 2, minWidth: '180px', position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Judul Baru — ketik untuk cari atau buat baru..."
                          value={linkedBookQuery}
                          onChange={(e) => {
                            setLinkedBookQuery(e.target.value);
                            if (isForceCreatingLinkedBook) setIsForceCreatingLinkedBook(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            height: '42px',
                            boxSizing: 'border-box'
                          }}
                        />

                        {/* Dropdown Overlay ala Image 3 */}
                        {matchedLinkedBooks.length > 0 && !isForceCreatingLinkedBook && (
                          <div style={{
                            position: 'absolute',
                            top: '46px',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            zIndex: 50,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                          }}>
                            {matchedLinkedBooks.map((opt) => (
                              <div
                                key={opt.id}
                                onClick={() => {
                                  handleLinkBook(opt.id);
                                  setLinkedBookQuery('');
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderBottom: '1px solid var(--border)',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: 'var(--text-primary)',
                                  transition: 'background 0.2s ease',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span>{opt.type === 'book' ? '📖' : '📄'}</span>
                                  <span style={{ fontWeight: '500' }}>{opt.title}</span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    [{opt.type === 'book' ? 'Karya' : 'Naskah'}]
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={(e) => handleEditMasterOption(opt.id, e)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                                    title="Edit Master"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteMasterOption(opt.id, e)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '4px' }}
                                    title="Hapus Master"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div
                              onClick={() => setIsForceCreatingLinkedBook(true)}
                              style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--accent)',
                                background: 'var(--bg-card)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <span>+ Buat Karya/Buku Baru dengan judul "{linkedBookQuery}"</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Input Extra Fields + Simpan Red Button ala Image 2 saat no matches / force create / typing new */}
                      {(matchedLinkedBooks.length === 0 || isForceCreatingLinkedBook) && linkedBookQuery.trim() !== '' && (
                        <>
                          <input
                            type="text"
                            placeholder="Harga (Rp)"
                            value={formatThousand(linkedBookPrice)}
                            onChange={(e) => setLinkedBookPrice(parseThousand(e.target.value))}
                            style={{
                              flex: 1, minWidth: '120px',
                              padding: '10px 14px',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              fontSize: '14px',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              height: '42px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <div style={{ flex: 1, minWidth: '140px', position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Cari Penulis..."
                              value={linkedBookAuthorSearch}
                              onChange={(e) => {
                                const val = e.target.value;
                                setLinkedBookAuthorSearch(val);
                                const selected = penulisList.find(p => String(p.id) === linkedBookAuthorId);
                                if (!selected || selected.name !== val) {
                                  setLinkedBookAuthorId('');
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                height: '42px',
                                boxSizing: 'border-box'
                              }}
                            />
                            {showLinkedBookAuthorDropdown && matchedLinkedBookAuthors.length > 0 && (
                              <div style={{
                                position: 'absolute',
                                top: '46px',
                                left: 0,
                                right: 0,
                                background: 'var(--bg-panel)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                                zIndex: 50,
                                maxHeight: '180px',
                                overflowY: 'auto',
                              }}>
                                {matchedLinkedBookAuthors.map((p) => (
                                  <div
                                    key={p.id}
                                    onClick={() => {
                                      setLinkedBookAuthorId(String(p.id));
                                      setLinkedBookAuthorSearch(p.name);
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: 'var(--text-primary)',
                                      borderBottom: '1px solid var(--border)',
                                    }}
                                  >
                                    {p.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleCreateLinkedBook}
                            disabled={isSaving}
                            style={{
                              padding: '10px 18px',
                              fontSize: '14px',
                              fontWeight: '600',
                              borderRadius: '8px',
                              background: '#c5221f',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              height: '42px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxSizing: 'border-box'
                            }}
                          >
                            {isSaving ? 'Menyimpan...' : 'Simpan'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Baris utama: Tipe + input nama + (match list ATAU extra fields + tombol) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!hasMatches) {
                  handleCreateItem();
                }
              }}
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}
            >
              {/* Rolling Control: Urutan Format Nama */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  Urutan:
                </span>
                <button
                  type="button"
                  onClick={toggleTitleOrder}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--bg-card)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    height: '42px',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                  }}
                  title={`Urutan format: ${titleOrder === 'service_first' ? '💼 Paket dulu ➔ 📖 Karya' : '📖 Karya dulu ➔ 💼 Paket'}. Klik untuk ubah urutan (rolling).`}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: titleOrder === 'service_first' ? 'var(--accent)' : 'transparent',
                    color: titleOrder === 'service_first' ? '#fff' : 'var(--text-secondary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}>
                    <span>{titleOrder === 'service_first' ? '💼 Paket' : '📖 Karya'}</span>
                  </div>

                  <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    🔄
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: titleOrder === 'book_first' ? 'var(--accent)' : 'transparent',
                    color: titleOrder === 'book_first' ? '#fff' : 'var(--text-secondary)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                  }}>
                    <span>{titleOrder === 'service_first' ? '📖 Karya' : '💼 Paket'}</span>
                  </div>
                </button>
              </div>

              {/* Input nama / judul — universal search */}
              <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder={createType === 'service' ? 'Ketik nama layanan 💼 atau karya 📖 (atau buat baru)...' : 'Ketik judul karya 📖 atau layanan 💼 (atau buat baru)...'}
                  value={createFormData.name || createFormData.title}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCreateFormData(prev =>
                      createType === 'service'
                        ? { ...prev, name: val }
                        : { ...prev, title: val }
                    );
                  }}
                  onKeyDown={(e) => {
                    if (!hasMatches) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex(prev => (prev + 1) % matchedItems.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex(prev => (prev - 1 + matchedItems.length) % matchedItems.length);
                    } else if (e.key === 'Enter') {
                      if (highlightedIndex >= 0 && highlightedIndex < matchedItems.length) {
                        e.preventDefault();
                        const selectedItem = matchedItems[highlightedIndex];
                        handleSelect(selectedItem.value, selectedItem);
                        setCreateFormData(prev =>
                          createType === 'service' ? { ...prev, name: '' } : { ...prev, title: '' }
                        );
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    height: '42px',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Dropdown Suggestions Overlay */}
                {hasMatches && (
                  <div style={{
                    position: 'absolute',
                    top: '46px',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 50,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                    {matchedItems.map((item, idx) => (
                      <div
                        key={item.value}
                        onClick={() => {
                          handleSelect(item.value, item);
                          setCreateFormData(prev =>
                            createType === 'service' ? { ...prev, name: '' } : { ...prev, title: '' }
                          );
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                          transition: 'background 0.2s ease',
                          background: idx === highlightedIndex ? 'var(--bg-card)' : 'transparent',
                        }}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{item.source === 'Layanan' ? '💼' : '📖'}</span>
                          <span style={{ fontWeight: '500' }}>{item.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>[{item.source}]</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          {/* Tombol Edit Master */}
                          <button
                            type="button"
                            onClick={(e) => handleEditMasterOption(item.value, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              fontSize: '13px',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Edit Master"
                          >
                            ✏️
                          </button>
                          {/* Tombol Hapus Master */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMasterOption(item.value, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              fontSize: '13px',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Hapus Master"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!hasMatches && searchQuery.trim() ? (
                // Tidak ada match — tampilkan extra fields + tombol simpan
                createType === 'service' ? (
                  <>
                    <input
                      type="text"
                      placeholder="Harga Satuan (Rp)"
                      value={formatThousand(createFormData.price)}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, price: parseThousand(e.target.value) }))}
                      style={{
                        flex: 1, minWidth: '120px',
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        height: '42px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Deskripsi (opsional)"
                      value={createFormData.description}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                      style={{
                        flex: 2, minWidth: '160px',
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        height: '42px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      onClick={handleCreateItem}
                      disabled={isSaving}
                      style={{ padding: '10px 16px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', whiteSpace: 'nowrap', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Harga (Rp)"
                      value={formatThousand(createFormData.regular_price)}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, regular_price: parseThousand(e.target.value) }))}
                      style={{
                        flex: 1, minWidth: '120px',
                        padding: '10px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        height: '42px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ flex: 1, minWidth: '140px', position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Cari Penulis..."
                        value={authorSearchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAuthorSearchQuery(val);
                          const selected = penulisList.find(p => String(p.id) === createFormData.author_id);
                          if (!selected || selected.name !== val) {
                            setCreateFormData(prev => ({ ...prev, author_id: '' }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '14px',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          height: '42px',
                          boxSizing: 'border-box',
                        }}
                      />
                      {showAuthorDropdown && matchedAuthors.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '46px',
                          left: 0,
                          right: 0,
                          background: 'var(--bg-panel)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                          zIndex: 50,
                          maxHeight: '180px',
                          overflowY: 'auto',
                        }}>
                          {matchedAuthors.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setCreateFormData(prev => ({ ...prev, author_id: String(p.id) }));
                                setAuthorSearchQuery(p.name);
                              }}
                              style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: 'var(--text-primary)',
                                borderBottom: '1px solid var(--border)',
                                transition: 'background 0.2s',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              👤 {p.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="btn-primary"
                      onClick={handleCreateItem}
                      disabled={isSaving}
                      style={{ padding: '10px 16px', fontSize: '14px', fontWeight: '600', borderRadius: '8px', whiteSpace: 'nowrap', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                    >
                      {isSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </>
                )
              ) : null}
            </form>
          </>
        )}



        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingIndex === null) {
              handleAddItem();
            } else {
              handleSaveEdit();
            }
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', width: '100%' }}>
          {getRequiredFields().map((field) => {
            if (field.key === 'item_title') return null;

            if (field.key === 'package_name') return null;

            if (field.key === 'discount') {
              const currentDiscType = dynamicInputs.discountType || 'fixed';
              return (
                <div key={field.key} style={{ flex: 1, minWidth: '130px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{field.label} <span style={{ fontSize: '11px', opacity: 0.75 }}>(Opsional)</span></label>
                    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => setDynamicInputs(prev => ({ ...prev, discountType: 'fixed' }))}
                        style={{
                          padding: '1px 6px', fontSize: '10px', fontWeight: '600', border: 'none', cursor: 'pointer',
                          background: currentDiscType === 'fixed' ? 'var(--accent)' : 'transparent',
                          color: currentDiscType === 'fixed' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        Rp
                      </button>
                      <button
                        type="button"
                        onClick={() => setDynamicInputs(prev => ({ ...prev, discountType: 'percent' }))}
                        style={{
                          padding: '1px 6px', fontSize: '10px', fontWeight: '600', border: 'none', cursor: 'pointer',
                          background: currentDiscType === 'percent' ? 'var(--accent)' : 'transparent',
                          color: currentDiscType === 'percent' ? '#fff' : 'var(--text-secondary)'
                        }}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'var(--bg-panel)',
                      color: 'var(--text-primary)',
                      height: '42px',
                      boxSizing: 'border-box'
                    }}
                    value={currentDiscType === 'percent'
                      ? (dynamicInputs.discount !== undefined && dynamicInputs.discount !== null ? dynamicInputs.discount : '')
                      : formatThousand(dynamicInputs.discount ?? '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = currentDiscType === 'percent' ? (parseFloat(val) || 0) : parseThousand(val);
                      setDynamicInputs(prev => ({ ...prev, discount: parsed }));
                    }}
                    placeholder={currentDiscType === 'percent' ? '0 % (Opsional)' : '0 (Opsional)'}
                  />
                </div>
              );
            }

            return (
              <div key={field.key} style={{ flex: field.key === 'copyright_holder' ? 2 : 1, minWidth: '110px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)' }}>{field.label}</label>
                <input
                  type={field.type === 'currency' ? 'text' : (field.type === 'number' ? 'number' : 'text')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'var(--bg-panel)',
                    color: 'var(--text-primary)',
                    height: '42px',
                    boxSizing: 'border-box'
                  }}
                  value={field.type === 'currency'
                    ? formatThousand(dynamicInputs[field.key] ?? '')
                    : (dynamicInputs[field.key] !== undefined ? (dynamicInputs[field.key] === 0 ? '' : dynamicInputs[field.key]) : '')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDynamicInputs(prev => ({
                      ...prev,
                      [field.key]: field.type === 'currency'
                        ? parseThousand(val)
                        : (field.type === 'number' ? (parseFloat(val) || 0) : val)
                    }));
                  }}
                  placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                  min={field.key === 'quantity' ? "1" : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* Tombol Tambah / Edit */}
        {editingIndex === null ? (
          <button
            className="btn-primary"
            type="submit"
            onClick={handleAddItem}
            style={{
              width: '100%',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              marginTop: '4px',
              boxSizing: 'border-box'
            }}
          >
            + Tambah Item
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              className="btn-secondary"
              type="button"
              onClick={handleCancelEdit}
              style={{
                flex: 1,
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            >
              Batal
            </button>
            <button
              className="btn-primary"
              type="submit"
              onClick={handleSaveEdit}
              style={{
                flex: 2,
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
                boxSizing: 'border-box'
              }}
            >
              💾 Simpan Perubahan
            </button>
          </div>
        )}
      </form>
    </div>

      {/* List Item */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {items.map((item, index) => {
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <React.Fragment key={index}>
              <div
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index);
                  e.dataTransfer.setData('text/plain', String(index));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverIndex !== index) {
                    setDragOverIndex(index);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) {
                    setDragOverIndex(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    reorderItems(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: isDragOver
                    ? 'rgba(59, 130, 246, 0.08)'
                    : isDragging
                      ? 'var(--bg-panel)'
                      : 'var(--bg-card)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: isDragOver
                    ? '2px dashed var(--accent)'
                    : isDragging
                      ? '1px dashed var(--border)'
                      : '1px solid var(--border)',
                  opacity: isDragging ? 0.4 : 1,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  cursor: 'grab'
                }}
              >
                {/* Drag Handle Icon */}
                <div
                  title="Geser / Drag untuk mengubah urutan"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'grab',
                    userSelect: 'none',
                    lineHeight: 1,
                    letterSpacing: '-2px',
                    opacity: 0.7
                  }}
                >
                  ⋮⋮
                </div>

                <span style={{ fontWeight: '600', width: '20px', color: 'var(--text-secondary)' }}>{index + 1}.</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>"{item.item_title}"</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {/* Tampilkan ringkasan item berdasarkan kolom yang aktif secara dinamis */}
                    {activeProfile?.tableColumns?.filter(col => col.key !== 'item_title' && col.key !== 'total').map(col => {
                      let val = item[col.key];
                      if (col.type === 'formula' && col.formula) {
                        val = evaluateItemFormula(col.formula, item);
                      }
                      if (val === undefined || val === null || val === '') return null;
                      const displayVal = col.type === 'currency' ? formatPrice(Number(val)) : String(val);
                      return `${col.label}: ${displayVal}`;
                    }).filter(Boolean).join(' | ')}
                  </div>
                </div>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)', minWidth: '100px', textAlign: 'right' }}>
                  {formatPrice(calculateItemTotal(item))}
                </span>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleStartEdit(index)}
                    title="Ubah Item"
                    style={{ padding: '6px 10px', borderRadius: '6px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => {
                      if (editingIndex === index) {
                        handleCancelEdit();
                      }
                      removeItem(index);
                    }}
                    title="Hapus Item"
                    style={{ padding: '6px 10px', borderRadius: '6px', minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Pemisah Halaman Di Antara Card */}
              {index < items.length - 1 && (
                <div
                  key={`break-${index}`}
                  style={{
                    margin: '4px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: item.pageBreakAfter ? '#dc2626' : 'var(--border)', borderStyle: item.pageBreakAfter ? 'dashed' : 'solid', opacity: item.pageBreakAfter ? 0.8 : 0.4 }} />
                  <button
                    type="button"
                    onClick={() => updateItem(index, { pageBreakAfter: !item.pageBreakAfter })}
                    title={item.pageBreakAfter ? 'Klik untuk menghapus pemisah halaman' : 'Klik untuk menyisipkan pemisah halaman di antara item ini'}
                    style={{
                      margin: '0 8px',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: item.pageBreakAfter ? '1px dashed #dc2626' : '1px solid var(--border)',
                      background: item.pageBreakAfter ? '#fef2f2' : 'var(--bg-card)',
                      color: item.pageBreakAfter ? '#dc2626' : 'var(--text-secondary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.2s ease',
                      zIndex: 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    ✂️ {item.pageBreakAfter ? 'Batas Halaman: Item berikutnya ke Halaman Baru di PDF (Klik untuk Hapus)' : '+ Pemisah Halaman'}
                  </button>
                  <div style={{ flex: 1, height: '1px', background: item.pageBreakAfter ? '#dc2626' : 'var(--border)', borderStyle: item.pageBreakAfter ? 'dashed' : 'solid', opacity: item.pageBreakAfter ? 0.8 : 0.4 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {(paymentStatus === 'DP' && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'var(--bg-panel)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Nominal Dibayar (DP)</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              value={formatThousand(paidAmount)}
              onChange={(e) => setPaidAmount(parseThousand(e.target.value))}
              placeholder="0"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Catatan Pembayaran</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg-card)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="Catatan transfer, nomor referensi, dll."
            />
          </div>
        </div>
      ))}

      {/* Modal Edit Master Layanan / Karya */}
      <Modal
        open={showEditMasterModal}
        onClose={() => setShowEditMasterModal(false)}
        title={editMasterType === 'service' ? 'Ubah Data Master Layanan' : 'Ubah Data Master Karya'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              {editMasterType === 'service' ? 'Nama Layanan' : 'Judul Karya'}
            </label>
            <input
              type="text"
              value={editMasterData.name}
              onChange={(e) => setEditMasterData(prev => ({ ...prev, name: e.target.value }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
              {editMasterType === 'service' ? 'Harga Satuan (Rp)' : 'Harga Reguler (Rp)'}
            </label>
            <input
              type="text"
              value={formatThousand(editMasterData.price)}
              onChange={(e) => setEditMasterData(prev => ({ ...prev, price: parseThousand(e.target.value) }))}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>

          {editMasterType === 'service' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Deskripsi</label>
              <input
                type="text"
                value={editMasterData.description}
                onChange={(e) => setEditMasterData(prev => ({ ...prev, description: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>Penulis</label>
              <input
                type="text"
                placeholder="Cari Penulis..."
                value={editMasterAuthorSearchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditMasterAuthorSearchQuery(val);
                  const selected = penulisList.find(p => String(p.id) === editMasterData.author_id);
                  if (!selected || selected.name !== val) {
                    setEditMasterData(prev => ({ ...prev, author_id: '' }));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  height: '42px',
                }}
              />
              {showEditMasterAuthorDropdown && matchedEditMasterAuthors.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '64px',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  zIndex: 50,
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}>
                  {matchedEditMasterAuthors.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setEditMasterData(prev => ({ ...prev, author_id: String(p.id) }));
                        setEditMasterAuthorSearchQuery(p.name);
                      }}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      👤 {p.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button className="btn-secondary" type="button" onClick={() => setShowEditMasterModal(false)}>
              Batal
            </button>
             <button
               className="btn-primary"
               type="button"
               onClick={handleSaveMasterEdit}
               disabled={isSaving}
             >
               {isSaving ? 'Memperbarui...' : 'Perbarui'}
             </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
