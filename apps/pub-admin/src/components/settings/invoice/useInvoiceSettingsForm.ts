import { useState, useEffect } from 'react';
import { useInvoiceContext } from '../../../contexts/InvoiceContext';
import { useAppContext } from '../../../contexts/AppContext';
import { InvoiceProfile, InvoiceTableColumn } from '../../../types/invoice.types';
import { invoiceTemplates } from '../../../data/invoiceTemplates';

export function useInvoiceSettingsForm() {
  const {
    profiles,
    activeProfileId,
    setActiveProfileId,
    addOrUpdateProfile,
    deleteProfile,
    setProfiles,
    setTempPreviewProfile
  } = useInvoiceContext();
  const { showToast, showConfirm, addFile, files } = useAppContext();

  const [selectedProfileId, setSelectedProfileId] = useState<string>(activeProfileId);
  const [isEditingNew, setIsEditingNew] = useState<boolean>(false);

  // State untuk form input
  const [profileName, setProfileName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyTagline, setCompanyTagline] = useState('');
  const [invoiceTitleText, setInvoiceTitleText] = useState('INVOICE');
  const [accentColor, setAccentColor] = useState('#1e70cd');
  const [accentColorDark, setAccentColorDark] = useState('#1e3a8a');
  const [headerBgColor, setHeaderBgColor] = useState('#222933');
  const [headerPrimaryColor, setHeaderPrimaryColor] = useState('#d93838');
  const [headerSecondaryColor, setHeaderSecondaryColor] = useState('#d93838');
  const [defaultHal, setDefaultHal] = useState('');
  const [defaultLampiran, setDefaultLampiran] = useState('-');
  const [salamPembuka, setSalamPembuka] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [tableType, setTableType] = useState<string>('');
  const [notes, setNotes] = useState<string[]>([]);
  const [showSpesifikasi, setShowSpesifikasi] = useState(false);
  const [defaultSpesifikasi, setDefaultSpesifikasi] = useState('');
  const [signatureOffice, setSignatureOffice] = useState('');
  const [signatureLocation, setSignatureLocation] = useState('');
  const [signatureRole, setSignatureRole] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountOwner, setBankAccountOwner] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [signatureImg, setSignatureImg] = useState('');
  const [headerType, setHeaderType] = useState<'logo_only' | 'logo_text' | 'text_only'>('logo_text');
  const [tableColumns, setTableColumns] = useState<InvoiceTableColumn[]>([]);
  const [shippingType, setShippingType] = useState<'none' | 'global' | 'item'>('global');
  const [watermarkColor, setWatermarkColor] = useState('');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(8);
  const [invoiceNoFormat, setInvoiceNoFormat] = useState('KBM/{year}/{month}/{day}/{seq}');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyYoutube, setCompanyYoutube] = useState('');
  const [companyInstagram, setCompanyInstagram] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [showCompanyContact, setShowCompanyContact] = useState(false);
  const [footerBgColor, setFooterBgColor] = useState('');
  const [footerPrimaryColor, setFooterPrimaryColor] = useState('');
  const [footerSecondaryColor, setFooterSecondaryColor] = useState('');
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  // Helper to build full columns (injecting item_shipping_cost if needed)
  const getFullTableColumns = (cols: InvoiceTableColumn[], type: 'none' | 'global' | 'item') => {
    let finalCols = cols.filter(c => c.key !== 'item_shipping_cost');
    if (type === 'item') {
      const totalIdx = finalCols.findIndex(c => c.key === 'total');
      const shippingCol = { key: 'item_shipping_cost', label: 'Ongkos Kirim', type: 'currency' as const, align: 'right' as const, width: '100px' };
      if (totalIdx > -1) {
        finalCols.splice(totalIdx, 0, shippingCol);
      } else {
        finalCols.push(shippingCol);
      }
    }
    return finalCols;
  };

  // Memuat data profil terpilih ke dalam state form
  useEffect(() => {
    if (isEditingNew) {
      setProfileName('Profil Baru');
      setCompanyName('NAMA PERUSAHAAN');
      setCompanyTagline('TAGLINE PERUSAHAAN');
      setInvoiceTitleText('INVOICE');
      setAccentColor('#1e70cd');
      setAccentColorDark('#1e3a8a');
      setHeaderBgColor('#222933');
      setHeaderPrimaryColor('#d93838');
      setHeaderSecondaryColor('#d93838');
      setDefaultHal('Perihal Invoice');
      setDefaultLampiran('-');
      setSalamPembuka('Bersama surat ini kami memberikan gambaran rincian biaya dengan ketentuan sebagai berikut:');
      setActionLabel('transaksi');
      setTableType('');
      setNotes([]);
      setShowSpesifikasi(false);
      setDefaultSpesifikasi('');
      setSignatureOffice('Kantor Utama');
      setSignatureLocation('Kota Asal');
      setSignatureRole('Direktur');
      setSignatureName('Nama Penandatangan');
      setShowBankInfo(false);
      setBankName('');
      setBankAccountNo('');
      setBankAccountOwner('');
      setCompanyLogo('');
      setSignatureImg('');
      setHeaderType('logo_text');
      setTableColumns([
        { key: 'item_title', label: 'Judul', type: 'text', align: 'left' },
        { key: 'pages', label: 'Hal', type: 'text', align: 'center', width: '90px' },
        { key: 'paper_type', label: 'Jenis Naskah', type: 'text', align: 'center', width: '90px' },
        { key: 'quantity', label: 'Jml. Cetak', type: 'number', align: 'center', width: '80px' },
        { key: 'price', label: 'Cetak/pcs', type: 'currency', align: 'right', width: '100px' },
        { key: 'total', label: 'Total Biaya', type: 'formula', align: 'right', width: '110px', formula: '{price} * {quantity}' }
      ]);
      setShippingType('global');
      setWatermarkColor('');
      setWatermarkOpacity(8);
      setInvoiceNoFormat('KBM/{year}/{month}/{day}/{seq}');
      setCompanyWebsite('');
      setCompanyEmail('');
      setCompanyYoutube('');
      setCompanyInstagram('');
      setCompanyPhone('');
      setShowCompanyContact(false);
      setFooterBgColor('#222933');
      setFooterPrimaryColor('#d93838');
      setFooterSecondaryColor('#d93838');
    } else {
      const profile = profiles.find((p) => p.id === selectedProfileId);
      if (profile) {
        setProfileName(profile.name || '');
        setCompanyName(profile.companyName || '');
        setCompanyTagline(profile.companyTagline || '');
        setInvoiceTitleText(profile.invoiceTitleText || 'INVOICE');
        setAccentColor(profile.accentColor || '#1e70cd');
        setAccentColorDark(profile.accentColorDark || '#1e3a8a');
        setHeaderBgColor(profile.headerBgColor || '#222933');
        setHeaderPrimaryColor(profile.headerPrimaryColor || (profile as any).headerColor || profile.accentColor || '#d93838');
        setHeaderSecondaryColor(profile.headerSecondaryColor || (profile as any).headerColor || profile.accentColor || '#d93838');
        setFooterBgColor(profile.footerBgColor || profile.headerBgColor || '#222933');
        setFooterPrimaryColor(profile.footerPrimaryColor || profile.headerPrimaryColor || profile.accentColor || '#d93838');
        setFooterSecondaryColor(profile.footerSecondaryColor || profile.headerSecondaryColor || profile.accentColor || '#d93838');
        setDefaultHal(profile.defaultHal || '');
        setDefaultLampiran(profile.defaultLampiran || '-');
        setSalamPembuka(profile.salamPembuka || '');
        setActionLabel(profile.actionLabel || '');
        setTableType(profile.tableType || '');
        setNotes(profile.notes || []);
        setShowSpesifikasi(profile.showSpesifikasi || false);
        setDefaultSpesifikasi(profile.defaultSpesifikasi || '');
        setSignatureOffice(profile.signatureOffice || '');
        setSignatureLocation(profile.signatureLocation || '');
        setSignatureRole(profile.signatureRole || '');
        setSignatureName(profile.signatureName || '');
        setShowBankInfo(profile.showBankInfo || false);
        setBankName(profile.bankName || '');
        setBankAccountNo(profile.bankAccountNo || '');
        setBankAccountOwner(profile.bankAccountOwner || '');
        setCompanyLogo(profile.companyLogo || '');
        setSignatureImg(profile.signatureImg || '');
        setHeaderType(profile.headerType || 'logo_text');
 
        const colsWithoutShipping = (profile.tableColumns || []).filter(c => c.key !== 'item_shipping_cost');
        setTableColumns(colsWithoutShipping);
 
        const hasShippingCol = (profile.tableColumns || []).some(c => c.key === 'item_shipping_cost');
        const detectedType = profile.shippingType || (hasShippingCol ? 'item' : 'global');
        setShippingType(detectedType);
 
        setWatermarkColor(profile.watermarkColor || '');
        setWatermarkOpacity(profile.watermarkOpacity !== undefined ? profile.watermarkOpacity : 8);
        setInvoiceNoFormat(profile.invoiceNoFormat || 'KBM/{year}/{month}/{day}/{seq}');
        setCompanyWebsite(profile.companyWebsite || '');
        setCompanyEmail(profile.companyEmail || '');
        setCompanyYoutube(profile.companyYoutube || '');
        setCompanyInstagram(profile.companyInstagram || '');
        setCompanyPhone(profile.companyPhone || '');
        setShowCompanyContact(profile.showCompanyContact || false);
      }
    }
  }, [selectedProfileId, isEditingNew, profiles]);

  // Sinkronisasi selectedProfileId ketika activeProfileId berubah secara global
  useEffect(() => {
    if (!isEditingNew) {
      setSelectedProfileId(activeProfileId);
    }
  }, [activeProfileId, isEditingNew]);

  const currentEditingProfile: InvoiceProfile = {
    id: isEditingNew ? `profile_preview_${Date.now()}` : selectedProfileId,
    name: profileName,
    companyName,
    companyTagline,
    invoiceTitleText,
    accentColor,
    accentColorDark,
    headerBgColor,
    headerPrimaryColor,
    headerSecondaryColor,
    footerBgColor,
    footerPrimaryColor,
    footerSecondaryColor,
    defaultHal,
    defaultLampiran,
    salamPembuka,
    actionLabel,
    tableType,
    notes,
    showSpesifikasi,
    defaultSpesifikasi,
    signatureOffice,
    signatureLocation,
    signatureRole,
    signatureName,
    showBankInfo,
    bankName,
    bankAccountNo,
    bankAccountOwner,
    companyLogo,
    signatureImg,
    headerType,
    tableColumns: getFullTableColumns(tableColumns, shippingType),
    shippingType,
    watermarkColor,
    watermarkOpacity,
    invoiceNoFormat,
    companyWebsite,
    companyEmail,
    companyYoutube,
    companyInstagram,
    companyPhone,
    showCompanyContact
  };

  // Sinkronisasikan profil yang sedang diedit ke preview global di PanelKanan
  useEffect(() => {
    setTempPreviewProfile(currentEditingProfile);
    return () => {
      setTempPreviewProfile(null);
    };
  }, [
    isEditingNew,
    selectedProfileId,
    profileName,
    companyName,
    companyTagline,
    invoiceTitleText,
    accentColor,
    accentColorDark,
    headerBgColor,
    headerPrimaryColor,
    headerSecondaryColor,
    footerBgColor,
    footerPrimaryColor,
    footerSecondaryColor,
    defaultHal,
    defaultLampiran,
    salamPembuka,
    actionLabel,
    tableType,
    notes,
    showSpesifikasi,
    defaultSpesifikasi,
    signatureOffice,
    signatureLocation,
    signatureRole,
    signatureName,
    showBankInfo,
    bankName,
    bankAccountNo,
    bankAccountOwner,
    companyLogo,
    signatureImg,
    headerType,
    tableColumns,
    shippingType,
    watermarkColor,
    watermarkOpacity,
    invoiceNoFormat,
    companyWebsite,
    companyEmail,
    companyYoutube,
    companyInstagram,
    companyPhone,
    showCompanyContact,
    setTempPreviewProfile
  ]);

  const handleSave = () => {
    if (!profileName.trim()) {
      showToast('Nama Profil tidak boleh kosong!', 'error');
      return;
    }

    const savedProfile: InvoiceProfile = {
      ...currentEditingProfile,
      id: isEditingNew ? `profile_${Date.now()}` : selectedProfileId,
      tableColumns: getFullTableColumns(tableColumns, shippingType),
      shippingType
    };

    addOrUpdateProfile(savedProfile);
    setIsEditingNew(false);
    setSelectedProfileId(savedProfile.id);
    setActiveProfileId(savedProfile.id);
    showToast('Profil invoice berhasil disimpan!', 'success');
  };

  const handleCreateNew = () => {
    setIsEditingNew(true);
  };

  const handleLoadTemplate = (templateId: string) => {
    const tmpl = invoiceTemplates.find(t => t.templateId === templateId);
    if (!tmpl) return;
    const p = tmpl.profile;
    setProfileName(`${tmpl.label} (Salinan)`);
    setCompanyName(p.companyName || '');
    setCompanyTagline(p.companyTagline || '');
    setInvoiceTitleText(p.invoiceTitleText || 'INVOICE');
    setAccentColor(p.accentColor || '#1e70cd');
    setAccentColorDark(p.accentColorDark || '#1e3a8a');
    setHeaderBgColor(p.headerBgColor || '#222933');
    setHeaderPrimaryColor(p.headerPrimaryColor || '#d93838');
    setHeaderSecondaryColor(p.headerSecondaryColor || '#d93838');
    setDefaultHal(p.defaultHal || '');
    setDefaultLampiran(p.defaultLampiran || '-');
    setSalamPembuka(p.salamPembuka || '');
    setActionLabel(p.actionLabel || '');
    setTableType(p.tableType || '');
    setNotes(p.notes || []);
    setShowSpesifikasi(p.showSpesifikasi || false);
    setDefaultSpesifikasi(p.defaultSpesifikasi || '');
    setSignatureOffice(p.signatureOffice || '');
    setSignatureLocation(p.signatureLocation || '');
    setSignatureRole(p.signatureRole || '');
    setSignatureName(p.signatureName || '');
    setShowBankInfo(p.showBankInfo || false);
    setBankName(p.bankName || '');
    setBankAccountNo(p.bankAccountNo || '');
    setBankAccountOwner(p.bankAccountOwner || '');
    setCompanyLogo(p.companyLogo || '');
    setSignatureImg(p.signatureImg || '');
    setHeaderType(p.headerType || 'logo_text');
    
    const colsWithoutShipping = (p.tableColumns || []).filter(c => c.key !== 'item_shipping_cost');
    setTableColumns(colsWithoutShipping);

    const hasShippingCol = (p.tableColumns || []).some(c => c.key === 'item_shipping_cost');
    const detectedType = p.shippingType || (hasShippingCol ? 'item' : 'global');
    setShippingType(detectedType);

    setWatermarkColor(p.watermarkColor || '');
    setWatermarkOpacity(p.watermarkOpacity !== undefined ? p.watermarkOpacity : 8);
    setInvoiceNoFormat((p as any).invoiceNoFormat || 'KBM/{year}/{month}/{day}/{seq}');
    setCompanyWebsite((p as any).companyWebsite || '');
    setCompanyEmail((p as any).companyEmail || '');
    setCompanyYoutube((p as any).companyYoutube || '');
    setCompanyInstagram((p as any).companyInstagram || '');
    setCompanyPhone((p as any).companyPhone || '');
    setShowCompanyContact((p as any).showCompanyContact || false);

    setShowTemplateModal(false);
  };

  const handleCancelNew = () => {
    setIsEditingNew(false);
    setSelectedProfileId(activeProfileId);
  };

  const handleDelete = () => {
    if (profiles.length <= 1) {
      showToast('Tidak dapat menghapus satu-satunya profil yang tersisa!', 'error');
      return;
    }
    showConfirm({
      title: 'Hapus Profil',
      message: `Apakah Anda yakin ingin menghapus profil "${profileName}"?`,
      confirmText: 'Hapus',
      type: 'danger',
      onConfirm: () => {
        deleteProfile(selectedProfileId);
        showToast('Profil berhasil dihapus.', 'success');
        const remaining = profiles.filter((p) => p.id !== selectedProfileId);
        if (remaining.length > 0) {
          setSelectedProfileId(remaining[0].id);
        }
      }
    });
  };

  const handleExportBackup = async () => {
    try {
      const dataStr = JSON.stringify(profiles, null, 2);
      const bytes = new TextEncoder().encode(dataStr);
      const filename = `pubdesk_invoice_profiles_backup.json`;

      const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
      const physicalPath = await tauriInvoke<string>('create_physical_file', {
        filename,
        bytes: Array.from(bytes),
        folder: 'backups'
      });

      const alreadyExists = files.some((f) => f.filename === filename && f.type === 'other');
      if (!alreadyExists) {
        const fileData = {
          filename,
          path: physicalPath,
          type: 'other',
          project_id: undefined,
          version_label: 'Backup',
          status: 'Aktif',
          last_modified: new Date().toISOString(),
          is_readonly: false
        };
        await addFile(fileData);
      }

      showToast(`Backup berhasil diekspor ke: ${physicalPath}`, 'success');
      await tauriInvoke('open_file_location_physically', { path: physicalPath });
    } catch (error) {
      console.error(error);
      showToast('Gagal mengekspor backup.', 'error');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const isValid = parsed.every((p) => p.id && p.name && p.companyName);
            if (isValid) {
              setProfiles(parsed);
              setSelectedProfileId(parsed[0].id);
              setActiveProfileId(parsed[0].id);
              showToast('Backup profil berhasil di-import!', 'success');
            } else {
              showToast('Format berkas backup JSON tidak valid!', 'error');
            }
          } else {
            showToast('Berkas backup JSON kosong atau tidak valid!', 'error');
          }
        } catch (error) {
          console.error(error);
          showToast('Gagal mengurai berkas JSON backup.', 'error');
        }
      };
    }
  };

  return {
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    isEditingNew,
    setIsEditingNew,
    profileName,
    setProfileName,
    companyName,
    setCompanyName,
    companyTagline,
    setCompanyTagline,
    invoiceTitleText,
    setInvoiceTitleText,
    accentColor,
    setAccentColor,
    accentColorDark,
    setAccentColorDark,
    headerBgColor,
    setHeaderBgColor,
    headerPrimaryColor,
    setHeaderPrimaryColor,
    headerSecondaryColor,
    setHeaderSecondaryColor,
    defaultHal,
    setDefaultHal,
    defaultLampiran,
    setDefaultLampiran,
    salamPembuka,
    setSalamPembuka,
    actionLabel,
    setActionLabel,
    tableType,
    setTableType,
    notes,
    setNotes,
    showSpesifikasi,
    setShowSpesifikasi,
    defaultSpesifikasi,
    setDefaultSpesifikasi,
    signatureOffice,
    setSignatureOffice,
    signatureLocation,
    setSignatureLocation,
    signatureRole,
    setSignatureRole,
    signatureName,
    setSignatureName,
    showBankInfo,
    setShowBankInfo,
    bankName,
    setBankName,
    bankAccountNo,
    setBankAccountNo,
    bankAccountOwner,
    setBankAccountOwner,
    companyLogo,
    setCompanyLogo,
    signatureImg,
    setSignatureImg,
    headerType,
    setHeaderType,
    tableColumns,
    setTableColumns,
    shippingType,
    setShippingType,
    watermarkColor,
    setWatermarkColor,
    watermarkOpacity,
    setWatermarkOpacity,
    invoiceNoFormat,
    setInvoiceNoFormat,
    companyWebsite,
    setCompanyWebsite,
    companyEmail,
    setCompanyEmail,
    companyYoutube,
    setCompanyYoutube,
    companyInstagram,
    setCompanyInstagram,
    companyPhone,
    setCompanyPhone,
    showCompanyContact,
    setShowCompanyContact,
    footerBgColor,
    setFooterBgColor,
    footerPrimaryColor,
    setFooterPrimaryColor,
    footerSecondaryColor,
    setFooterSecondaryColor,
    showTemplateModal,
    setShowTemplateModal,
    expandedSection,
    setExpandedSection,
    handleSave,
    handleCreateNew,
    handleLoadTemplate,
    handleCancelNew,
    handleDelete,
    handleExportBackup,
    handleImportBackup
  };
}
