import {useEffect, useState} from 'react';
import type {ProblemPost} from '../types';
import {problemApi} from '../lib/api';
import {CheckCircle2, Loader2, Tag as TagIcon} from 'lucide-react';
import {AuthorBadge} from './AuthorBadge'; // 确保你已经创建了这个组件

interface Props {
    onItemClick: (id: number) => void;
}

export const ProblemFeed = ({ onItemClick }: Props) => {
    const [problems, setProblems] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [debugMsg, setDebugMsg] = useState("");

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                // 使用 any 绕过类型检查，直接读取真实结构
                const res = await problemApi.get<any>('/v1/problem/list', {
                    params: { page: 1, page_size: 20 }
                });

                // 兼容 status 200 和 0
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

                            {/* ✨ 作者信息 (解耦组件) */}
                            {item.authorid > 0 && (
                                <div className="flex items-center gap-2 mb-3 mt-1" onClick={(e) => e.stopPropagation()}>
                                    <AuthorBadge userId={item.authorid}/>
                                </div>
                            )}

                            {/* ✨ Tags (字符串分割) */}
                            <div className="flex flex-wrap gap-2 mb-4">
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
