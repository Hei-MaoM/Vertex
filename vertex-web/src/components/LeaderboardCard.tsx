import {useEffect, useState} from 'react';
import {Loader2, Trophy} from 'lucide-react';
import {userApi} from '../lib/api';
import type {CommonResp} from '../types';

interface LeaderboardUser {
    id: number;
    username: string;
    avatar: string;
    collectcnt: number;
    rank: number;
}

interface Props {
    onUserClick?: (id: number) => void; // ✨ 接收点击回调
}

export const LeaderboardCard = ({onUserClick}: Props) => {
    const [list, setList] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRank = async () => {
            try {
                const res = await userApi.get<CommonResp<LeaderboardUser[]>>('/v1/user/leaderboard');
                if (res.data.status === 0 || res.data.status === 200) {
                    setList((res.data.data || []).slice(0, 20));
                }
            } catch (e) {
                console.error("加载排行榜失败", e);
            } finally {
                setLoading(false);
            }
        };
        fetchRank();
    }, []);

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[500px]">
            {/* Header */}
            <div
                className="p-4 border-b border-gray-50 flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-white flex-shrink-0">
                <Trophy className="text-yellow-500" size={18}/>
                <h3 className="font-bold text-gray-800">收藏榜</h3>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? (
                    <div className="py-8 flex justify-center text-gray-400">
                        <Loader2 className="animate-spin" size={20}/>
                    </div>
                ) : list.length === 0 ? (
                    <div className="py-8 text-center text-xs text-gray-400">暂无数据</div>
                ) : (
                    <ul className="space-y-1">
                        {list.map((user, index) => (
                            <li
                                key={user.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition group cursor-pointer" // ✨ 添加 cursor-pointer
                                onClick={() => onUserClick && onUserClick(user.id)} // ✨ 点击整行跳转
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* 排名 */}
                                    <div className={`
                                        w-6 h-6 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold
                                        ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                        index === 1 ? 'bg-gray-100 text-gray-600' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                                'text-gray-400 bg-gray-50'}
                                    `}>
                                        {index + 1}
                                    </div>

                                    {/* 头像 */}
                                    <img
                                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full bg-gray-100 object-cover border border-gray-100 flex-shrink-0"
                                    />

                                    {/* 用户名 */}
                                    <div
                                        className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-600 transition">
                                        {user.username}
                                    </div>
                                </div>

                                {/* 分数 */}
                                <div
                                    className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                    {user.collectcnt}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="px-4 py-2 bg-gray-50 text-center border-t border-gray-100 flex-shrink-0">
                <span className="text-[10px] text-gray-400">每 30 分钟更新 • Top 20</span>
            </div>
        </div>
    );
};
