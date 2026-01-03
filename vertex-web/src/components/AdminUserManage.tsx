import {useState} from 'react';
import {userApi} from '../lib/api';
import type {User} from '../types';
import {Ban, CheckCircle, Lock, Shield, ShieldAlert, UserCog} from 'lucide-react'; // 引入 Lock 图标

interface Props {
    currentUser: User | null;
}

export const AdminUserManage = ({currentUser}: Props) => {
    const [targetUserId, setTargetUserId] = useState('');
    const [targetAuth, setTargetAuth] = useState('2');
    const [managing, setManaging] = useState(false);

    // ✨ 判断是否为超级管理员
    const isSuperAdmin = currentUser?.authority === 3;

    // 权限修改 (增加前端拦截)
    const handleSetAuthority = async () => {
        if (!targetUserId) return alert("请输入用户ID");

        // ✨ 拦截 Level 2
        if (!isSuperAdmin) return alert("权限不足：只有超级管理员可以修改权限等级");

        if (!window.confirm(`确定修改 ID: ${targetUserId} 的权限吗？`)) return;

        setManaging(true);
        try {
            const res = await userApi.post('/v1/user/setauthority', {
                id: Number(targetUserId),
                authority: Number(targetAuth)
            });
            if (res.data.status === 0 || res.data.status === 200) {
                alert("修改成功");
                setTargetUserId('');
            } else {
                alert("失败: " + res.data.msg);
            }
        } catch (e: any) {
            alert("请求错误: " + e.message);
        } finally {
            setManaging(false);
        }
    };

    // 状态修改 (Level 2 和 3 都可以用，无需拦截)
    const handleSetStatus = async (status: number) => {
        if (!targetUserId) return alert("请输入用户ID");
        const action = status === 1 ? "封禁" : "解封";
        if (!window.confirm(`确定要 ${action} ID: ${targetUserId} 吗？`)) return;

        setManaging(true);
        try {
            const res = await userApi.post('/v1/user/setstatus', {
                id: Number(targetUserId),
                status: status
            });
            if (res.data.status === 0 || res.data.status === 200) {
                alert(`${action}成功`);
                setTargetUserId('');
            } else {
                alert("失败: " + res.data.msg);
            }
        } catch (e: any) {
            alert("请求错误: " + e.message);
        } finally {
            setManaging(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                <div className="bg-purple-100 p-2 rounded-lg">
                    <UserCog className="text-purple-600" size={24}/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">用户管理控制台</h2>
                    <p className="text-sm text-gray-400">
                        当前身份: <span
                        className="font-bold text-purple-600">{isSuperAdmin ? "超级管理员 (Lv.3)" : "管理员 (Lv.2)"}</span>
                    </p>
                </div>
            </div>

            <div className="max-w-2xl space-y-8">
                {/* 1. 目标锁定 */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">目标用户 ID</label>
                    <input
                        type="number"
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        placeholder="请输入 User ID"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none transition font-mono text-lg"
                    />
                </div>

                {/* 2. 功能区域 Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ✨✨✨ 权限卡片 (差异化渲染) ✨✨✨ */}
                    <div className={`
                        p-5 rounded-xl border-2 transition-all relative overflow-hidden
                        ${isSuperAdmin
                        ? 'border-purple-100 bg-purple-50/50 hover:border-purple-200'
                        : 'border-gray-100 bg-gray-50 opacity-70 cursor-not-allowed'} 
                    `}>
                        {/* 如果不是超管，加个蒙层或者锁图标 */}
                        {!isSuperAdmin && (
                            <div className="absolute top-2 right-2 text-gray-400">
                                <Lock size={16}/>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={18} className={isSuperAdmin ? "text-purple-600" : "text-gray-400"}/>
                            <h3 className="font-bold text-gray-700">权限变更</h3>
                        </div>

                        <div className="space-y-3">
                            <select
                                value={targetAuth}
                                onChange={(e) => setTargetAuth(e.target.value)}
                                disabled={!isSuperAdmin} // ✨ 禁用
                                className="w-full p-2 rounded-lg border border-purple-200 bg-white text-sm disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="1">Level 1 - 普通用户</option>
                                <option value="2">Level 2 - 管理员</option>
                                <option value="3">Level 3 - 超级管理员</option>
                            </select>
                            <button
                                onClick={handleSetAuthority}
                                disabled={!isSuperAdmin || managing} // ✨ 禁用
                                className={`
                                    w-full py-2 rounded-lg font-medium transition
                                    ${isSuperAdmin
                                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                {isSuperAdmin ? "确认修改" : "需要 Lv.3 权限"}
                            </button>
                        </div>
                    </div>

                    {/* 封禁卡片 (所有人可用) */}
                    <div
                        className="p-5 rounded-xl border-2 border-red-100 bg-red-50/50 hover:border-red-200 transition-all">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert size={18} className="text-red-600"/>
                            <h3 className="font-bold text-gray-700">账号状态</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handleSetStatus(1)}
                                disabled={managing}
                                className="bg-white border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 flex flex-col items-center justify-center gap-1 transition"
                            >
                                <Ban size={18}/>
                                <span className="text-xs">封禁账号</span>
                            </button>
                            <button
                                onClick={() => handleSetStatus(0)}
                                disabled={managing}
                                className="bg-white border border-green-200 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 flex flex-col items-center justify-center gap-1 transition"
                            >
                                <CheckCircle size={18}/>
                                <span className="text-xs">解封恢复</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
