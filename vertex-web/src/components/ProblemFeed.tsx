import {useEffect, useState} from 'react';
import type {ProblemPost} from '../types';
import {problemApi} from '../lib/api';
import {CheckCircle2, Loader2, Tag as TagIcon, Sparkles} from 'lucide-react'; // ✨ 引入 Sparkles 图标
import {AuthorBadge} from './AuthorBadge';

interface Props {
    onItemClick: (id: number) => void;
    onUserClick?: (id: number) => void;
}

export const ProblemFeed = ({onItemClick, onUserClick}: Props) => {
    const [problems, setProblems] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugMsg, setDebugMsg] = useState("");

    // ✨ 状态：当前是否是推荐模式
    const [isRecommend, setIsRecommend] = useState(false);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                // ✨✨✨ 判断登录状态 ✨✨✨
                const hasToken = !!localStorage.getItem('jwt_token');

                // 决定 API 路径
                const endpoint = hasToken ? '/v1/problem/recommend' : '/v1/problem/list';

                setIsRecommend(hasToken);

                const res = await problemApi.get<any>(endpoint, {
                    params: {
                        page: 1,
                        // 推荐接口通常叫 count，列表叫 page_size，为了兼容可以都传
                        page_size: 20,
                        count: 20
                    }
                });

                if (res.data.status === 200 || res.data.status === 0) {
                    const list = res.data.data || [];
                    setProblems(list);
                } else {
                    setDebugMsg(`状态码非200: ${res.data.status}`);
                }
            } catch (err: any) {
                console.error("获取题目失败", err);
                setDebugMsg("请求报错: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (problems.length === 0) {
        return (
            <div className="text-center p-10 text-gray-400">
                <p>暂无题目</p>
                {debugMsg && <p className="text-xs text-red-400 mt-2">Debug: {debugMsg}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ✨✨✨ 推荐模式下的标题提示 (可选) ✨✨✨ */}
            {isRecommend && (
                <div className="flex items-center gap-2 px-2 pb-2 text-sm font-bold text-gray-500">
                    <Sparkles size={16} className="text-yellow-500" />
                    为你推荐
                </div>
            )}

            {problems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onItemClick(item.id)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group relative"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                                  {item.source || "原创"}
                                </span>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1">
                                    {item.title}
                                </h3>
                                {item.is_solved && <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50 flex-shrink-0"/>}
                            </div>

                            {/* Author Info */}
                            {item.authorid > 0 && (
                                <div className="mb-3 mt-1">
                                    <AuthorBadge
                                        userId={item.authorid}
                                        onClick={onUserClick}
                                    />
                                </div>
                            )}

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {item.tags && item.tags.length > 0 ? (
                                    item.tags.split(',').map((tagName, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md"
                                        >
                                            <TagIcon size={12}/> {tagName.trim()}
                                        </div>
                                    ))
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
