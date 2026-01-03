import {useEffect, useState} from 'react';
import {userApi} from '../lib/api';
import type {CommonResp, User} from '../types';

interface Props {
    userId: number;
    onClick?: (id: number) => void; // ✨ 接收点击回调
}

export const AuthorBadge = ({userId, onClick}: Props) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (!userId) return;
        // 简单请求用户信息 (实际项目中可以使用 react-query 缓存)
        userApi.get<CommonResp<User>>('/v1/user/showinfo', {
            params: {id: userId}
        })
            .then(res => {
                if (res.data.status === 0 || res.data.status === 200) {
                    setUser(res.data.data);
                }
            })
            .catch(() => {
            });
    }, [userId]);

    if (!user) {
        return <span className="text-gray-300 text-xs animate-pulse">加载中...</span>;
    }

    return (
        <div
            className="flex items-center gap-2 group cursor-pointer hover:bg-gray-100 pr-2 py-0.5 rounded-full transition relative z-10"
            onClick={(e) => {
                // ✨ 阻止事件冒泡，防止触发父级（如 ProblemFeed）的点击事件
                e.stopPropagation();
                if (onClick) onClick(userId);
            }}
            title="点击查看主页"
        >
            <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.username}
                className="w-5 h-5 rounded-full bg-white border border-gray-200 object-cover"
            />
            <span className="text-xs text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
                {user.username}
            </span>
            {user.authority >= 2 && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded font-bold scale-90 origin-left">
                    Lv.{user.authority}
                </span>
            )}
        </div>
    );
};
