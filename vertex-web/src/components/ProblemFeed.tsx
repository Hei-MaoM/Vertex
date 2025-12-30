import {useEffect, useState} from 'react';
import type {CommonResp, ProblemPost} from '../types';
import {problemApi} from '../lib/api';
import {CheckCircle2, Loader2, MessageSquare, Tag as TagIcon, ThumbsUp} from 'lucide-react';

export const ProblemFeed = () => {
    const [problems, setProblems] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await problemApi.get<CommonResp<ProblemPost[]>>('/v1/problem/list', {
                    params: {page: 1, page_size: 20}
                });

                // 🔍 调试日志：看看后端到底回了什么
                console.log("题目列表原始数据:", res.data);

                // ✅ 修正取值逻辑：直接取 res.data.data
                if (res.data.status === 200) {
                    // 兼容处理：防止 data 为 null
                    const list = res.data.data || [];
                    setProblems(list);
                } else {
                    setProblems([]);
                }
            } catch (err) {
                console.error("获取题目失败", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500"/>
    </div>;

    if (problems.length === 0) return <div className="text-center p-10 text-gray-400">暂无题目，快去发布一个吧！</div>;

    return (
        <div className="space-y-4">
            {problems.map((item) => (
                <div key={item.id}
                     className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                  {item.source}
                </span>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                                    {item.title}
                                </h3>
                                {/* 这里的 is_solved 需要后端支持，如果后端没返回，就是 undefined */}
                                {item.is_solved && <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50"/>}
                            </div>
                            <div className="flex gap-2 mb-4">
                                {/* 如果 item.tags 是 null，给个空数组防止报错 */}
                                {(item.tags || []).map(tag => (
                                    <div key={tag.id}
                                         className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        <TagIcon size={12}/> {tag.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-gray-400 text-sm">
                        <span className="text-xs">难度系数: {item.score}</span>
                        <button className="flex items-center gap-1 hover:text-blue-500 ml-auto"><ThumbsUp size={16}/> 赞
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500"><MessageSquare size={16}/> 评论
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
