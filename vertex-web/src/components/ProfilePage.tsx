import React, {useEffect, useState} from 'react';
import type {CommonResp, ProblemPost, User} from '../types';
import {problemApi} from '../lib/api';
import {
    Ban,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Loader2,
    Shield,
    Trash2,
    User as UserIcon
} from 'lucide-react';

interface Props {
    user: User;
    onBack: () => void;
    onItemClick: (id: number) => void;
}

const TABS = [
    {label: '全部', value: -1, icon: <FileText size={16}/>},
    {label: '待审核', value: 0, icon: <Clock size={16} className="text-orange-500"/>},
    {label: '已发布', value: 1, icon: <CheckCircle2 size={16} className="text-green-500"/>},
    {label: '已下架', value: 2, icon: <Ban size={16} className="text-red-500"/>},
];

export const ProfilePage = ({user, onBack, onItemClick}: Props) => {
    const [activeTab, setActiveTab] = useState(-1);
    const [posts, setPosts] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);

    // 加载列表
    const fetchMyPosts = async () => {
        try {
            setLoading(true);
            const res = await problemApi.get<any>('/v1/problem/myposts', {
                params: {page: 1, page_size: 20, status: activeTab}
            });
            const status = res.data.status ?? res.data.Status;
            const data = res.data.data;
            const list = Array.isArray(data) ? data : (data?.list || []);

            if (status === 0 || status === 200) {
                setPosts(list);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, [activeTab]);

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm("确定要删除这条内容吗？此操作不可恢复。")) return;
        try {
            const res = await problemApi.post<CommonResp>('/v1/problem/delete', {id: id});
            if (res.data.status === 0 || res.data.status === 200) {
                alert("删除成功");
                setPosts(prev => prev.filter(post => post.id !== id));
            } else {
                alert("删除失败: " + res.data.msg);
            }
        } catch (err: any) {
            alert("请求错误");
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

            {/* ✨✨✨ 全新设计的头部卡片 ✨✨✨ */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* 背景装饰 */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                    <UserIcon size={200}/>
                </div>

                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                    {/* 头像 */}
                    <div className="relative">
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                            alt={user.username}
                        />
                        {/* 权限徽章 */}
                        {user.authority >= 2 && (
                            <div
                                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-sm"
                                title="管理员">
                                <Shield size={16} fill="currentColor"/>
                            </div>
                        )}
                    </div>

                    {/* 信息区 */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                {user.username}
                            </h1>
                            <p className="text-gray-400 text-sm mt-1 flex gap-3">
                                <span>ID: {user.id}</span>
                                <span>•</span>
                                <span>{user.email}</span>
                            </p>
                        </div>

                        {/* ✨ 数据统计栏 ✨ */}
                        <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100 w-fit">
                            <div className="text-center min-w-[60px]">
                                <div className="font-black text-xl text-gray-800">{user.solvecnt || 0}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">已解决
                                </div>
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="text-center min-w-[60px]">
                                <div className="font-black text-xl text-gray-800">{user.postcnt || 0}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">发帖</div>
                            </div>
                            <div className="w-px bg-gray-200"></div>
                            <div className="text-center min-w-[60px]">
                                <div className="font-black text-xl text-gray-800">{user.collectcnt || 0}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">获赞/藏
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Calendar
                                size={14}/> 加入于 {user.created_at?.substring(0, 10)}</span>
                        </div>
                    </div>

                    {/* 返回按钮 */}
                    <button onClick={onBack}
                            className="text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition">
                        ← 返回首页
                    </button>
                </div>
            </div>

            {/* 帖子列表 Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    {TABS.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition relative
                     ${activeTab === tab.value ? 'text-blue-600 bg-blue-50/30' : 'text-gray-500 hover:bg-gray-50'}
                   `}
                        >
                            {tab.icon} {tab.label}
                            {activeTab === tab.value && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 min-h-[300px]">
                    {loading ?
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500"/>
                        </div> :
                        posts.length === 0 ? <div className="text-center text-gray-400 py-10">暂无内容</div> : (
                            <div className="space-y-4">
                                {posts.map(post => (
                                    <div
                                        key={post.id}
                                        className="p-4 border rounded-lg hover:border-blue-200 transition flex justify-between items-center bg-white hover:shadow-sm cursor-pointer group"
                                        onClick={() => onItemClick(post.id)}
                                    >
                                        <div>
                                            <h3 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition text-lg">{post.title}</h3>
                                            <div className="text-xs text-gray-500 flex gap-2 items-center">
                                                <span
                                                    className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{post.source || "原创"}</span>
                                                {/* 可以在这里加标签 */}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onItemClick(post.id);
                                                }}
                                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition"
                                            >
                                                <Eye size={16}/> 查看
                                            </button>

                                            <button
                                                onClick={(e) => handleDelete(e, post.id)}
                                                className="text-sm text-gray-400 hover:text-red-600 font-medium flex items-center gap-1 p-2 rounded-md hover:bg-red-50 transition"
                                                title="删除"
                                            >
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};
