import {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {ArrowLeft, Loader2, Search as SearchIcon, Tag as TagIcon, CheckCircle2} from 'lucide-react';
import {problemApi} from '../lib/api';
import {AuthorBadge} from '../components/AuthorBadge';
import type {CommonResp, ListRespData, ProblemPost} from '../types';

export const SearchResultPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || "";
    const navigate = useNavigate();

    const [list, setList] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) return;

        const doSearch = async () => {
            setLoading(true);
            try {
                // 调用后端搜索接口 (假设是 /v1/problem/search)
                const res = await problemApi.get<CommonResp<ListRespData<ProblemPost>>>('/v1/problem/search', {
                    params: { keyword: query }
                });

                if (res.data.status === 0 || res.data.status === 200) {
                    // 兼容 list 结构 (有的接口返回 data.list，有的是直接 data)
                    // 根据您之前的 ListResp 定义，Data 直接就是 []ProblemPost
                    // @ts-ignore
                    const data = res.data.data || [];
                    setList(Array.isArray(data) ? data : (data.list || []));
                }
            } catch (err) {
                console.error("搜索失败", err);
            } finally {
                setLoading(false);
            }
        };

        doSearch();
    }, [query]);

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
            {/* 顶部 Header */}
            <div className="flex items-center gap-4 mb-6 py-4 border-b border-gray-100">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                    <SearchIcon size={24} className="text-blue-600" />
                    搜索结果: <span className="text-blue-600">"{query}"</span>
                </div>
            </div>

            {/* 内容区域 */}
            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : list.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                    <p>没有找到相关题目，换个词试试？</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/problem/${item.id}`)}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                                            {item.source || "原创"}
                                        </span>
                                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition line-clamp-1">
                                            {item.title}
                                        </h3>
                                        {item.is_solved && <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-50 flex-shrink-0"/>}
                                    </div>

                                    {item.authorid > 0 && (
                                        <div className="mb-3 mt-1" onClick={e => e.stopPropagation()}>
                                            <AuthorBadge userId={item.authorid} onClick={(uid) => navigate(`/user/${uid}`)} />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {item.tags && item.tags.split(',').map((tag, idx) => (
                                            <div key={idx} className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                                <TagIcon size={12}/> {tag.trim()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
