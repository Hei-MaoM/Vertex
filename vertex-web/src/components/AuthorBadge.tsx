import {useEffect, useState} from 'react';
import {userApi} from '../lib/api';
import type {CommonResp} from '../types';

interface UserInfo {
    id: number;
    username: string;
    avatar: string;
}

// 简单的内存缓存
const userCache: Record<number, UserInfo> = {};

export const AuthorBadge = ({userId}: { userId: number }) => {
    const [author, setAuthor] = useState<UserInfo | null>(null);

    useEffect(() => {
        if (!userId) return;

        // 1. 先查缓存
        if (userCache[userId]) {
            setAuthor(userCache[userId]);
            return;
        }

        // 2. 没缓存，调接口 GET /v1/user/showinfo?id=...
        const fetchUser = async () => {
            try {
                // 注意：你的 user.api 定义的是 GET /v1/user/showinfo (UserInfoReq)
                // GET 请求参数要放 params 里，或者拼在 URL
                const res = await userApi.get<CommonResp<UserInfo>>('/v1/user/showinfo', {
                    params: {id: userId}
                });

                if (res.data.status === 0 || res.data.status === 200) {
                    const userData = res.data.data;
                    setAuthor(userData);
                    userCache[userId] = userData; // 写入缓存
                }
            } catch (err) {
                console.error(`加载用户 ${userId} 失败`, err);
            }
        };

        fetchUser();
    }, [userId]);

    if (!author) {
        return <span className="text-xs text-gray-300">加载中...</span>;
    }

    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <img
                src={author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.username}`}
                alt={author.username}
                className="w-5 h-5 rounded-full border border-gray-200 group-hover:border-blue-300 transition"
            />
            <span className="text-xs text-gray-500 group-hover:text-blue-600 transition">
                {author.username}
            </span>
        </div>
    );
};
