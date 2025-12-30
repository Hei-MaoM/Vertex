import { useState, useEffect } from 'react';
import type {ProblemPost} from '../types';
import { problemApi } from '../lib/api';
import { CheckCircle2, MessageSquare, ThumbsUp, Tag as TagIcon, Loader2 } from 'lucide-react';

interface Props {
    onItemClick: (id: number) => void;
}

export const ProblemFeed = ({ onItemClick }: Props) => {
    const [problems, setProblems] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await problemApi.get<any>('/v1/problem/list', {
                    params: { page: 1, page_size: 20 }
                });

                if (res.data.status === 200 || res.data.status === 0) {
                    const list = res.data.data || [];
                    setProblems(list);
                }
            } catch (err: any) {
                console.error("获取题目失败", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;

    if (problems.length === 0) return <div className="text-center p-10 text-gray-400">暂无题目</div>;

    return (
        <div className="space-y-4">
            {problems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onItemClick(item.id)}
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                  {item.source || "原创"}
                </span>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">
                                    {item.title}
                                </h3>
                                {item.is_solved && <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50" />}
                            </div>
                            <div className="flex gap-2 mb-4">
                                {(item.tags || []).map(tag => (
                                    <div key={tag.id} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                        <TagIcon size={12} /> {tag.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50 text-gray-400 text-sm">
                        <button className="flex items-center gap-1 hover:text-blue-500 ml-auto"><ThumbsUp size={16} /> 赞</button>
                        <button className="flex items-center gap-1 hover:text-blue-500"><MessageSquare size={16} /> 评论</button>
                    </div>
                </div>
            ))}
        </div>
    );
};
