import React, { useEffect, useState, useCallback } from "react";
import { MoreVertical, Edit2, Loader2, Eye, Power, X } from "lucide-react";
import api from "../api/axios";
import { PageHeader } from "../components/PageHeader";
import { DataTable } from "../components/DataTable";
import { Modal } from "../components/Modal";
import type { Identity } from "../types/DTO";
import type { BaseEntity, Permission } from "../types/UserManagementDTO";

const UserManagement: React.FC = () => {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [owners, setOwners] = useState<BaseEntity[]>([]);
  const [brands, setBrands] = useState<BaseEntity[]>([]);
  const [subvendors, setSubvendors] = useState<BaseEntity[]>([]);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "permissions">(
    "general",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [selectedIdentity, setSelectedIdentity] = useState<Identity | null>(
    null,
  );
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [formData, setFormData] = useState({ email: "", role: "" });
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>(
    [],
  );
  const [selection, setSelection] = useState({
    ownerId: "",
    brandId: "",
    subvendorId: "",
  });

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [idRes, owRes] = await Promise.all([
        api.get("/identities"),
        api.post("/owners", {}),
      ]);
      setIdentities(idRes.data?.data || idRes.data || []);
      setOwners(owRes.data?.data || owRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    console.log("selectedIdentity : ", selectedIdentity);
  }, [selectedIdentity]);

  const fetchBrandsByOwner = async (ownerId: string | number) => {
    if (!ownerId) {
      setBrands([]);
      return [];
    }
    try {
      const res = await api.post("/brands", { ownerId: Number(ownerId) });
      const data = res.data?.data || res.data || [];
      setBrands(data);
      return data;
    } catch (err) {
      return [];
    }
  };

  const fetchSubvendorsByBrand = async (brandId: string | number) => {
    if (!brandId) {
      setSubvendors([]);
      return [];
    }
    try {
      // Body içerisinde gönderiyoruz (POST)
      const res = await api.post("/subvendors", { brandId: Number(brandId) });
      const data = res.data?.data || res.data || [];
      setSubvendors(data);
      return data;
    } catch (err) {
      return [];
    }
  };

  const openActionModal = async (identity: Identity, mode: "view" | "edit") => {
    setSelectedIdentity(identity);
    setModalMode(mode);
    setFormData({ email: identity.email || "", role: identity.role || "" });
    setActiveTab("general");

    // Yetki Objelerini Doldur
    const perms: Permission[] = [];
    if (identity.subvendor)
      perms.push({
        type: "SUBVENDOR",
        id: identity.subvendorId!,
        name: identity.subvendor.name,
      });
    else if (identity.brand)
      perms.push({
        type: "BRAND",
        id: identity.brandId!,
        name: identity.brand.name,
      });
    else if (identity.owner)
      perms.push({
        type: "OWNER",
        id: identity.ownerId!,
        name: identity.owner.name,
      });
    setAssignedPermissions(perms);

    // Seçim state'lerini başlangıç verisiyle doldur
    setSelection({
      ownerId: identity.ownerId ? String(identity.ownerId) : "",
      brandId: identity.brandId ? String(identity.brandId) : "",
      subvendorId: identity.subvendorId ? String(identity.subvendorId) : "",
    });

    // Bağlı listeleri tetikle
    if (identity.ownerId) await fetchBrandsByOwner(identity.ownerId);
    if (identity.brandId) await fetchSubvendorsByBrand(identity.brandId);

    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const updatePermissionFromSelection = (
    type: Permission["type"],
    id: string,
    name: string,
  ) => {
    if (id) {
      setAssignedPermissions([{ type, id: Number(id), name }]);
    }
  };

  const handleSaveChanges = async () => {
    if (modalMode === "view" || !selectedIdentity) return;
    setIsSaving(true);
    try {
      const activePerm = assignedPermissions[0];
      const payload = {
        email: formData.email,
        role: formData.role,
        ownerId: activePerm?.type === "OWNER" ? activePerm.id : null,
        brandId: activePerm?.type === "BRAND" ? activePerm.id : null,
        subvendorId: activePerm?.type === "SUBVENDOR" ? activePerm.id : null,
      };
      await api.patch(`/identities/${selectedIdentity.id}`, payload);
      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Kullanıcı Yönetimi"
        onAddClick={() => {}}
        addButtonText={""}
      />

      <DataTable
        headers={["E-POSTA", "ROL", "BAĞLI YAPI", "İŞLEMLER"]}
        loading={loading}
      >
        {identities.map((item) => (
          <tr
            key={item.id}
            className="border-b relative hover:bg-gray-50 transition-colors text-sm"
          >
            <td className="px-6 py-4">{item.email}</td>
            <td className="px-6 py-4 font-bold text-blue-600 uppercase text-[10px]">
              {item.role}
            </td>
            <td className="px-6 py-4 text-gray-500 italic">
              {item.subvendor?.name ||
                item.brand?.name ||
                item.owner?.name ||
                "SİSTEM ADMİN"}
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex justify-end relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === item.id ? null : item.id)
                  }
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <MoreVertical size={18} className="text-gray-500" />
                </button>
                {openMenuId === item.id && (
                  <div className="absolute right-8 top-0 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                    <button
                      onClick={() => openActionModal(item, "view")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 transition-colors"
                    >
                      <Eye size={16} /> Görüntüle
                    </button>
                    <button
                      onClick={() => openActionModal(item, "edit")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit2 size={16} /> Güncelle
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <Power size={16} /> Pasifleştir
                    </button>
                  </div>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "edit" ? "Kullanıcıyı Güncelle" : "Kullanıcı Bilgileri"
        }
      >
        <div className="flex gap-6 border-b mb-6">
          <button
            onClick={() => setActiveTab("general")}
            className={`pb-2 text-sm font-bold transition-all ${activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400"}`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`pb-2 text-sm font-bold transition-all ${activeTab === "permissions" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400"}`}
          >
            Yetki & Hiyerarşi
          </button>
        </div>

        <div className="min-h-[380px]">
          {activeTab === "general" ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  E-Posta
                </label>
                <input
                  disabled={modalMode === "view"}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full mt-1 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Sistem Rolü
                </label>
                <select
                  disabled={modalMode === "view"}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full mt-1 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none disabled:opacity-60"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="OWNER">OWNER</option>
                  <option value="BRAND">BRAND</option>
                  <option value="SUBVENDOR">SUBVENDOR</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {modalMode === "edit" && (
                <div className="bg-blue-50/30 p-5 rounded-3xl border border-blue-100/50 space-y-4">
                  <select
                    value={selection.ownerId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name =
                        owners.find((o) => o.id === Number(id))?.name || "";
                      setSelection({
                        ownerId: id,
                        brandId: "",
                        subvendorId: "",
                      });
                      setSubvendors([]);
                      fetchBrandsByOwner(id);
                      updatePermissionFromSelection("OWNER", id, name);
                    }}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value={selectedIdentity?.ownerId as number}>
                      {selectedIdentity?.owner?.name || "Şirket"}
                    </option>
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>

                  <select
                    disabled={!selection.ownerId}
                    value={selection.brandId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name =
                        brands.find((b) => b.id === Number(id))?.name || "";
                      setSelection({
                        ...selection,
                        brandId: id,
                        subvendorId: "",
                      });
                      fetchSubvendorsByBrand(id);
                      updatePermissionFromSelection("BRAND", id, name);
                    }}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white disabled:bg-gray-100"
                  >
                    <option value={selectedIdentity?.brandId as number}>
                      {selectedIdentity?.brand?.name || "Marka"}
                    </option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>

                  <select
                    disabled={!selection.brandId}
                    value={selection.subvendorId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const name =
                        subvendors.find((s) => s.id === Number(id))?.name || "";
                      setSelection({ ...selection, subvendorId: id });
                      updatePermissionFromSelection("SUBVENDOR", id, name);
                    }}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-white disabled:bg-gray-100"
                  >
                    <option value={selectedIdentity?.subvendorId as number}>
                      {selectedIdentity?.subvendor?.name || "Şube"}
                    </option>
                    {subvendors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-100 rounded-3xl p-5 bg-white">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Aktif Yetki
                </span>
                {assignedPermissions.length > 0 ? (
                  assignedPermissions.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl mt-3 border border-blue-100"
                    >
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase">
                          {p.type}
                        </p>
                        <p className="text-sm font-bold text-gray-700">
                          {p.name}
                        </p>
                      </div>
                      {modalMode === "edit" && (
                        <button
                          onClick={() => {
                            setAssignedPermissions([]);
                            setSelection({
                              ownerId: "",
                              brandId: "",
                              subvendorId: "",
                            });
                          }}
                          className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-gray-400 text-xs italic">
                    Seçim yapılmadı.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => setIsModalOpen(false)}
            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold"
          >
            Vazgeç
          </button>
          {modalMode === "edit" && (
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold"
            >
              {isSaving ? (
                <Loader2 className="animate-spin mx-auto" size={20} />
              ) : (
                "Değişiklikleri Kaydet"
              )}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
