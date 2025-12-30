import {useEffect, useState} from 'react';
import type {User} from '../types';
import {userApi} from '../lib/api';
import {LogOut, Settings, UserCircle} from 'lucide-react';

interface UserCardProps {
    onShowLogin: () => void;
    onEditProfile: (user: User) => void;
    refreshTrigger?: number;
    // ✨ 新增：加载完用户后，把权限值传出去
    onUserLoaded?: (authority: number) => void;
}

export const UserCard = ({onShowLogin, onEditProfile, refreshTrigger, onUserLoaded}: UserCardProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setLoading(false);
                setUser(null);
                // 如果没登录，通知父组件权限为0
                if (onUserLoaded) onUserLoaded(0);
                return;
            }

            try {
                setLoading(true);
                // 使用 any 绕过类型检查
                const res = await userApi.post<any>('/v1/user/myinfo');

                // 兼容 status 200 和 0
                if (res.data.status === 200 || res.data.status === 0) {
                    const userData = res.data.data;
                    setUser(userData);

                    // ✨ 核心修改：通知父组件当前的权限
                    if (onUserLoaded && userData) {
                        console.log("UserCard: 更新权限为", userData.authority);
                        onUserLoaded(userData.authority);
                    }
                } else {
                    if (res.data.status === 401) localStorage.removeItem('jwt_token');
                    setUser(null);
                    if (onUserLoaded) onUserLoaded(0);
                }
            } catch (error) {
                console.error("获取用户信息失败", error);
                setUser(null);
                if (onUserLoaded) onUserLoaded(0);
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
        return <div className="h-48 bg-gray-100 rounded-xl animate-pulse"/>;
    }

    if (!user) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <UserCircle className="w-16 h-16 mx-auto text-gray-300 mb-4"/>
                <p className="text-gray-500 mb-4">加入 Vertex 社区</p>
                <button onClick={onShowLogin}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                    登录 / 注册
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-20">
            <div className="flex flex-col items-center">
                <img
                    src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Vertex"}
                    alt={user.username}
                    className="w-20 h-20 rounded-full border-4 border-blue-50 object-cover"
                />
                <h2 className="mt-4 text-xl font-bold text-gray-800">{user.username}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
                    <div>
                        <div className="font-bold">Lv.{user.authority}</div>
                        <div className="text-xs text-gray-400">权限</div>
                    </div>
                </div>
                <div className="w-full mt-6 space-y-2">
                    <button
                        onClick={() => onEditProfile(user)}
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm transition"
                    >
                        <Settings size={16}/> 编辑资料
                    </button>
                    <button onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm">
                        <LogOut size={16}/> 退出登录
                    </button>
                </div>
            </div>
        </div>
    );
};
