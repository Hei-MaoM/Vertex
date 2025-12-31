import { useEffect, useState } from 'react';
import type {User} from '../types';
import { userApi } from '../lib/api';
import { UserCircle, Settings, LogOut } from 'lucide-react';

interface UserCardProps {
    onShowLogin: () => void;
    onEditProfile: (user: User) => void;
    refreshTrigger?: number;
    // ✨ 改动：返回完整的 User 对象给父组件
    onUserLoaded?: (user: User) => void;
    // ✨ 新增：点击进入个人主页的回调
    onGoProfile?: () => void;
}

export const UserCard = ({ onShowLogin, onEditProfile, refreshTrigger, onUserLoaded, onGoProfile }: UserCardProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setLoading(false);
                setUser(null);
                return;
            }

            try {
                setLoading(true);
                const res = await userApi.post<any>('/v1/user/myinfo');

                // 兼容 status 200 和 0
                if (res.data.status === 200 || res.data.status === 0) {
                    const userData = res.data.data;
                    setUser(userData);

                    // ✨ 通知 App 组件更新当前用户信息
                    if (onUserLoaded && userData) {
                        onUserLoaded(userData);
                    }
                } else {
                    if (res.data.status === 401) localStorage.removeItem('jwt_token');
                    setUser(null);
                }
            } catch (error) {
                console.error("获取用户信息失败", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [refreshTrigger]);

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        window.location.reload();
    };

    if (loading && localStorage.getItem('jwt_token')) {
        return <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />;
    }

    if (!user) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <UserCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">加入 Vertex 社区</p>
                <button onClick={onShowLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    登录 / 注册
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-20">
            <div className="flex flex-col items-center">
                {/* ✨ 头像增加点击跳转 */}
                <div onClick={onGoProfile} className="cursor-pointer transition transform hover:scale-105">
                    <img
                        src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Vertex"}
                        alt={user.username}
                        className="w-20 h-20 rounded-full border-4 border-blue-50 object-cover"
                    />
                </div>

                {/* ✨ 名字增加点击跳转 */}
                <h2
                    onClick={onGoProfile}
                    className="mt-4 text-xl font-bold text-gray-800 hover:text-blue-600 cursor-pointer transition"
                >
                    {user.username}
                </h2>

                <p className="text-sm text-gray-500">{user.email}</p>

                {/*<div className="grid grid-cols-1 gap-4 w-full mt-6 text-center">*/}
                {/*    <div><div className="font-bold">Lv.{user.authority}</div><div className="text-xs text-gray-400">权限</div></div>*/}
                {/*</div>*/}
                <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
                    {/* 解题数 */}
                    <div>
                        <div className="font-bold">{user.solvecnt || 0}</div>
                        <div className="text-xs text-gray-400">已解决</div>
                    </div>

                    {/* 被收藏数 */}
                    <div>
                        <div className="font-bold">{user.collectcnt || 0}</div>
                        <div className="text-xs text-gray-400">获赞藏</div>
                    </div>

                    {/* 发帖数 */}
                    <div>
                        <div className="font-bold">{user.postcnt || 0}</div>
                        <div className="text-xs text-gray-400">发帖</div>
                    </div>
                </div>
                <div className="w-full mt-6 space-y-2">
                    <button
                        onClick={() => onEditProfile(user)}
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition"
                    >
                        <Settings size={16} /> 编辑资料
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm">
                        <LogOut size={16} /> 退出登录
                    </button>
                </div>
            </div>
        </div>
    );
};
