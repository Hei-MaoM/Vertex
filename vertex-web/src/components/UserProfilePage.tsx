import {useEffect, useState} from 'react';
import {ArrowLeft, BookOpen, Calendar, Loader2, Trophy} from 'lucide-react';
import {problemApi, userApi} from '../lib/api';
import type {CommonResp, ListRespData, ProblemPost, User} from '../types';

// 也可以复用 AuthorBadge (虽然这里肯定是同一个作者)

interface Props {
    userId: number;
    onBack: () => void;
    onItemClick: (id: number) => void; // 点击题目进入详情
}

export const UserProfilePage = ({userId, onBack, onItemClick}: Props) => {
    // 用户信息状态
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    // 题目列表状态
    const [posts, setPosts] = useState<ProblemPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setUserLoading(true);
            try {
                const res = await userApi.get<CommonResp<User>>('/v1/user/showinfo', {
                    params: {id: userId}
                });
                if (res.data.status === 0 || res.data.status === 200) {
                    setUser(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setUserLoading(false);
            }
        };

        const fetchPosts = async () => {
            setPostsLoading(true);
            try {
                // ✨ 调用您新提供的 ShowOtherPost 接口
                const res = await problemApi.get<CommonResp<ListRespData<ProblemPost>>>('/v1/problem/posts', {
                    params: {
                        id: userId, // 传目标用户ID
                        page: 1,
                        page_size: 20 // 先只拿前20条，暂不做分页
                    }
                });

                // 处理列表数据
                // 注意：ListRespData 通常包含 total 和 data (或者 list)
                // 您的 ListResp 定义中 data 是 []ProblemPost
                if (res.data.status === 0 || res.data.status === 200) {
                    // 这里直接拿 res.data.data (它是数组)
                    // 如果您的后端 ListResp 定义的是 Data []ProblemPost，那就是 res.data.data
                    // @ts-ignore
                    setPosts(res.data.data || []);
                }
            } catch (err) {
                console.error("加载题目失败", err);
            } finally {
                setPostsLoading(false);
            }
        };

        if (userId) {
            fetchUser();
            fetchPosts();
        }
    }, [userId]);

    if (userLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-500 mb-2" size={32}/>
                <span className="text-gray-400">正在加载大神主页...</span>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center py-20 text-gray-500">用户不存在</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 顶部导航 */}
            <button onClick={onBack}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition group">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
                返回
            </button>

            {/* 用户信息卡片 (Header) */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-48 overflow-hidden bg-gray-50">
                    <div
                        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 opacity-60"></div>
                    {/* 装饰圆圈 */}
                    <div
                        className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div
                        className="absolute top-0 -left-4 w-40 h-40 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>


                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6">
                    {/* 头像 */}
                    <div
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            alt={user.username}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-2xl font-black text-gray-900 flex items-center justify-center md:justify-start gap-2">
                            {user.username}
                            {user.authority >= 2 && (
                                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                                    Lv.{user.authority}
                                </span>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-1">
                            <Calendar size={12}/> 加入于 {new Date(user.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* 数据统计 */}
                    <div className="flex gap-8 mb-2">
                        <div className="text-center">
                            <div className="text-xl font-black text-gray-900">{user.solvecnt}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">已解决</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black text-blue-600">{user.postcnt}</div>
                            <div className="text-xs text-blue-500 uppercase font-bold tracking-wider">发布</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-black text-gray-900">{user.collectcnt}</div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">获赞</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 下方内容区：发布的题目列表 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                    <BookOpen className="text-blue-500" size={18}/>
                    <h3 className="font-bold text-gray-800">TA 发布的题目 ({posts.length})</h3>
                </div>

                {postsLoading ? (
                    <div className="p-10 flex justify-center">
                        <Loader2 className="animate-spin text-gray-400"/>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
                        <Trophy size={32} className="opacity-20"/>
                        <p>暂时还没有发布过题目</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {posts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => onItemClick(post.id)}
                                className="p-4 hover:bg-gray-50 transition cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1">
                                        {post.title}
                                    </h4>
                                    {post.is_solved && (
                                        <span
                                            className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                                            已打卡
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                                        {post.source || "原创"}
                                    </span>

                                    {/* 标签 (如果是字符串需要 split) */}
                                    {post.tags && post.tags.split(',').map((tag, idx) => (
                                        <span key={idx} className="text-gray-400"># {tag}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
