import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../api";
import { type User } from "../../types";
import { AxiosError } from "axios";
import {
  Shield,
  Search,
  Ban,
  PauseCircle,
  CheckCircle2,
  Trash2,
  Lock,
} from "lucide-react";
import ConfirmModal from "../ui/ConfirmModal";

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  variant: "success" | "danger" | "warning" | "info";
  confirmText?: string;
  action: () => void;
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [modalConfig, setModalConfig] = useState<Partial<ModalConfig>>({
    isOpen: false,
  });

  const myRole = (localStorage.getItem("role") || "staff").toLowerCase();
  const currentUsername = localStorage.getItem("username");
  const allowedRoles = ["director", "manager"];
  const isAuthorized = allowedRoles.includes(myRole);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
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
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u)),
      );
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      alert(error.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("ลบไม่สำเร็จ");
    }
  };

  const normalizeRole = (role?: string | null): string =>
    (role || "staff").toLowerCase();

  // ✅ แก้ไข Logic ตรงนี้: Director จัดการ Director ไม่ได้
  const canManageUser = (my: string, target: string): boolean => {
    const me = normalizeRole(my);
    const t = normalizeRole(target);

    // ถ้าฉันเป็น Director
    if (me === "director") {
      // จะจัดการได้ก็ต่อเมื่อ เป้าหมาย "ไม่ใช่" Director เหมือนกัน
      return t !== "director";
    }

    // ถ้าฉันเป็น Manager จัดการได้แค่ Staff
    if (me === "manager") return t === "staff";

    return false;
  };

  const handleActionClick = (
    id: number,
    type: "delete" | "suspend" | "fire" | "active",
  ) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (!canManageUser(myRole, target.role || "staff")) {
      alert("คุณไม่มีสิทธิ์จัดการผู้ใช้งานในระดับสิทธิ์นี้");
      return;
    }

    const actions = {
      delete: {
        title: "ลบผู้ใช้งานถาวร?",
        message: "ข้อมูลจะหายไปจากระบบทันที",
        variant: "danger" as const,
        confirmText: "ลบทันที",
        fn: () => handleDeleteUser(id),
      },
      fire: {
        title: "ไล่ออก?",
        message: "เปลี่ยนสถานะเป็น Terminated",
        variant: "danger" as const,
        confirmText: "ยืนยัน",
        fn: () => handleStatusChange(id, "fired"),
      },
      suspend: {
        title: "พักงาน?",
        message: "ผู้ใช้งานจะเข้าสู่ระบบไม่ได้ชั่วคราว",
        variant: "warning" as const,
        confirmText: "พักงาน",
        fn: () => handleStatusChange(id, "suspended"),
      },
      active: {
        title: "คืนสภาพ?",
        message: "ผู้ใช้งานจะกลับมาใช้งานได้ปกติ",
        variant: "success" as const,
        confirmText: "คืนสภาพ",
        fn: () => handleStatusChange(id, "active"),
      },
    };

    const config = actions[type];
    setModalConfig({
      isOpen: true,
      title: config.title,
      message: config.message,
      variant: config.variant,
      confirmText: config.confirmText,
      action: config.fn,
    });
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.fullname || "").toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [users, searchTerm],
  );

  const RoleBadge = ({ role }: { role: string }) => {
    const r = normalizeRole(role);
    const badgeColors: Record<string, string> = {
      director:
        "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
      manager:
        "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
      staff:
        "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${badgeColors[r] || badgeColors.staff}`}
      >
        {r}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = (status || "active").toLowerCase();
    const statusConfig: Record<string, { cls: string; text: string }> = {
      fired: {
        cls: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
        text: "Terminated",
      },
      suspended: {
        cls: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
        text: "Suspended",
      },
      active: {
        cls: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
        text: "Active",
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
      <div className="p-12 text-center text-zinc-400 dark:text-zinc-500 animate-pulse">
        Loading...
      </div>
    );
  if (!isAuthorized)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-zinc-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white mb-2">
          Access Restricted
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
          คุณไม่มีสิทธิ์เข้าถึงส่วนจัดการผู้ใช้งาน
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in font-prompt">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-black p-6 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <Shield className="text-indigo-600 dark:text-indigo-400" />{" "}
            จัดการผู้ใช้งาน
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            สิทธิ์ปัจจุบัน:{" "}
            <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400">
              {myRole}
            </span>
          </p>
        </div>
        <div className="relative group flex-1 md:w-64">
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm transition-all focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 text-zinc-800 dark:text-white placeholder:text-zinc-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="p-5 pl-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  User Info
                </th>
                <th className="p-5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Role
                </th>
                <th className="p-5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                  Status
                </th>
                <th className="p-5 pr-6 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredUsers.map((u) => {
                const targetRole = normalizeRole(u.role);
                // Logic นี้จะคืนค่า false ถ้า Director เจอ Director
                const canManage =
                  u.username !== currentUsername &&
                  canManageUser(myRole, targetRole);

                return (
                  <tr
                    key={u.id}
                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="p-5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 text-sm">
                          {(u.username || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-700 dark:text-white">
                            {u.fullname}
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">
                            @{u.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-5">
                      <StatusBadge status={u.status || "active"} />
                    </td>
                    {/* ตรงนี้ถ้า canManage เป็น false จะเป็นช่องว่างเปล่าๆ ไม่แสดงปุ่ม */}
                    <td className="p-5 pr-6 text-right">
                      {canManage && (
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {u.status !== "active" ? (
                            <button
                              onClick={() => handleActionClick(u.id, "active")}
                              className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                              title="คืนสภาพ"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleActionClick(u.id, "suspend")
                                }
                                className="p-2 rounded-lg text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                                title="พักงาน"
                              >
                                <PauseCircle size={18} />
                              </button>
                              {myRole === "director" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleActionClick(u.id, "fire")
                                    }
                                    className="p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                                    title="ไล่ออก"
                                  >
                                    <Ban size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleActionClick(u.id, "delete")
                                    }
                                    className="p-2 rounded-lg text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        isOpen={modalConfig.isOpen || false}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.action || (() => {})}
        title={modalConfig.title || ""}
        message={modalConfig.message || ""}
        variant={modalConfig.variant || "danger"}
        confirmText={modalConfig.confirmText}
      />
    </div>
  );
}
