import { Info, Facebook } from "lucide-react";

// ✅ แก้ไขข้อมูลทีมงานตรงนี้
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "ชื่อ-นามสกุล (คนที่ 1)",
    role: "Full Stack Developer",
    image: "https://pub.shop9bath.online/profile-1.jpg", // ใส่ Link รูปจริง
    facebook: "https://facebook.com/your-profile-1",
  },
  {
    id: 2,
    name: "ชื่อ-นามสกุล (คนที่ 2)",
    role: "Frontend Developer",
    image:
      "https://ui-avatars.com/api/?name=Member+2&background=random&size=200",
    facebook: "https://facebook.com/your-profile-2",
  },
  {
    id: 3,
    name: "ชื่อ-นามสกุล (คนที่ 3)",
    role: "System Analyst",
    image:
      "https://ui-avatars.com/api/?name=Member+3&background=random&size=200",
    facebook: "https://facebook.com/your-profile-3",
  },
];

export default function About() {
  return (
    <div className="space-y-8 animate-fade-in pb-10 font-prompt">
      {/* Header */}
      <div className="text-center space-y-2 py-6">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Info size={32} />
        </div>
        <h2 className="text-3xl font-bold text-zinc-800 dark:text-white">
          คณะผู้จัดทำ
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          ทีมงานผู้พัฒนาระบบ Shop9Bath
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Image Profile */}
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random&size=200`;
                  }}
                />
              </div>
            </div>

            {/* Name & Role */}
            <h3 className="text-lg font-bold text-zinc-800 dark:text-white mb-1">
              {member.name}
            </h3>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold rounded-full mb-4">
              {member.role}
            </span>

            {/* Facebook Button */}
            <a
              href={member.facebook}
              target="_blank"
              rel="noreferrer"
              className="mt-auto flex items-center gap-2 px-6 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-xl transition-transform active:scale-95 shadow-md shadow-blue-200 dark:shadow-none w-full justify-center"
            >
              <Facebook size={18} fill="currentColor" />
              ติดต่อ Facebook
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
