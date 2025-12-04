import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../../api';
import { type User } from '../../types';
import {
  Shield,
  Search,
  Ban,
  PauseCircle,
  CheckCircle2,
  Trash2,
  Lock,
} from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    variant: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
    variant: 'danger',
  });

  const myRole = (localStorage.getItem('role') || 'staff').toLowerCase();
  const currentUsername = localStorage.getItem('username');
  const allowedRoles = ['director', 'manager'];
  const isAuthorized = allowedRoles.includes(myRole);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthorized, fetchUsers]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/users/${id}/status`, { status: newStatus });
      // ✅ Optimistic Update
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)),
      );
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
          'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ',
      );
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      // ✅ Optimistic Update
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert('ลบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  // 🔐 Helper สำหรับ RBAC ฝั่ง UI
  const normalizeRole = (role?: string | null): string =>
    (role || 'staff').toLowerCase();

  const canManageUser = (my: string, target: string): boolean => {
    const me = normalizeRole(my);
    const t = normalizeRole(target);

    if (me === 'director') {
      // director จัดการได้ทุกคน (ยกเว้นตัวเอง เราเช็คต่างหาก)
      return true;
    }
    if (me === 'manager') {
      // manager จัดการได้เฉพาะ staff เท่านั้น
      return t === 'staff';
    }
    // staff ห้ามจัดการใครทั้งสิ้น
    return false;
  };

  const handleActionClick = (
    id: number,
    type: 'delete' | 'suspend' | 'fire' | 'active',
  ) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;

    // ถ้าไม่มีสิทธิ์จัดการตาม role → ตัดออกเลย
    if (!canManageUser(myRole, target.role || 'staff')) {
      alert('คุณไม่มีสิทธิ์จัดการผู้ใช้งานในระดับสิทธิ์นี้');
      return;
    }

    const actions = {
      delete: {
        title: 'ลบผู้ใช้งานถาวร?',
        message: 'ข้อมูลจะหายไปจากระบบทันที',
        variant: 'danger',
        confirmText: 'ลบทันที',
        fn: () => handleDeleteUser(id),
      },
      fire: {
        title: 'ไล่ออก?',
        message: 'เปลี่ยนสถานะเป็น Terminated',
        variant: 'danger',
        confirmText: 'ยืนยัน',
        fn: () => handleStatusChange(id, 'fired'),
      },
      suspend: {
        title: 'พักงาน?',
        message: 'ผู้ใช้งานจะเข้าสู่ระบบไม่ได้ชั่วคราว',
        variant: 'warning',
        confirmText: 'พักงาน',
        fn: () => handleStatusChange(id, 'suspended'),
      },
      active: {
        title: 'คืนสภาพ?',
        message: 'ผู้ใช้งานจะกลับมาใช้งานได้ปกติ',
        variant: 'success',
        confirmText: 'คืนสภาพ',
        fn: () => handleStatusChange(id, 'active'),
      },
    } as const;

    const config = actions[type];
    setModalConfig({
      isOpen: true,
      title: config.title,
      message: config.message,
      variant: config.variant as any,
      confirmText: config.confirmText,
      action: config.fn,
    });
  };

  const filteredUsers = useMemo(
    () =>
      users.filter((u) => {
        const name = u.username || '';
        const full = u.fullname || '';
        const term = searchTerm.toLowerCase();
        return (
          name.toLowerCase().includes(term) ||
          full.toLowerCase().includes(term)
        );
      }),
    [users, searchTerm],
  );

  const RoleBadge = ({ role }: { role: string }) => {
    const r = normalizeRole(role);
    const badgeColors: Record<string, string> = {
      director: 'bg-purple-100 text-purple-700 border-purple-200',
      manager: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      staff: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${
          badgeColors[r] || badgeColors.staff
        }`}
      >
        {r}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = (status || 'active').toLowerCase();
    const statusConfig: Record<
      string,
      { cls: string; text: string }
    > = {
      fired: {
        cls: 'bg-red-100 text-red-700 border-red-200',
        text: 'Terminated',
      },
      suspended: {
        cls: 'bg-orange-100 text-orange-700 border-orange-200',
        text: 'Suspended',
      },
      active: {
        cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        text: 'Active',
      },
    };
    const conf = statusConfig[s] || statusConfig.active;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${conf.cls}`}
      >
        {conf.text}
      </span>
    );
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400 animate-pulse">
        Loading...
      </div>
    );
  if (!isAuthorized)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-slate-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Access Restricted
        </h2>
        <p className="text-slate-500 max-w-md">
          คุณไม่มีสิทธิ์เข้าถึงส่วนจัดการผู้ใช้งาน
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-indigo-600" /> จัดการผู้ใช้งาน
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            สิทธิ์ปัจจุบัน:{' '}
            <span className="uppercase font-bold text-indigo-600">
              {myRole}
            </span>
          </p>
        </div>
        <div className="relative group flex-1 md:w-64">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-5 pl-6 text-xs font-bold text-slate-500 uppercase">
                  User Info
                </th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">
                  Role
                </th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">
                  Status
                </th>
                <th className="p-5 pr-6 text-xs font-bold text-slate-500 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const targetRole = normalizeRole(u.role);

                const canManage =
                  u.username !== currentUsername &&
                  canManageUser(myRole, targetRole);

                return (
                  <tr
                    key={u.id}
                    className="group hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                          {(u.username || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-700">
                            {u.fullname}
                          </div>
                          <div className="text-xs text-slate-400">
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-5">
                      <StatusBadge status={u.status || 'active'} />
                    </td>
                    <td className="p-5 pr-6 text-right">
                      {canManage && (
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.status !== 'active' ? (
                            // ปุ่มคืนสภาพ
                            <button
                              onClick={() =>
                                handleActionClick(u.id, 'active')
                              }
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
                              title="คืนสภาพ"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          ) : (
                            <>
                              {/* ปุ่มพักงาน */}
                              <button
                                onClick={() =>
                                  handleActionClick(u.id, 'suspend')
                                }
                                className="p-2 rounded-lg text-orange-500 hover:bg-orange-50"
                                title="พักงาน"
                              >
                                <PauseCircle size={18} />
                              </button>
                              {/* ปุ่มไล่ออก / ลบ เฉพาะ director */}
                              {myRole === 'director' && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleActionClick(u.id, 'fire')
                                    }
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                                    title="ไล่ออก"
                                  >
                                    <Ban size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleActionClick(u.id, 'delete')
                                    }
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    title="ลบถาวร"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() =>
          setModalConfig({ ...modalConfig, isOpen: false })
        }
        onConfirm={modalConfig.action}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
}
