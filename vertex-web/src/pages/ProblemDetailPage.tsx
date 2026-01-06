import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {ArrowLeft, CheckCircle2, ExternalLink, Eye, Loader2, Star, Trophy} from 'lucide-react';
import {problemApi} from '../lib/api';
import {AuthorBadge} from '../components/AuthorBadge';
// ✨✨✨ 1. 引入 Markdown 组件 ✨✨✨
import {MarkdownViewer} from '../components/MarkdownViewer';
import type {CommonResp, ProblemDetail} from '../types';

export const ProblemDetailPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    // === 状态 ===
    const [detail, setDetail] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isSolved, setIsSolved] = useState(false);
    const [solving, setSolving] = useState(false);
    const [isCollected, setIsCollected] = useState(false);
    const [collecting, setCollecting] = useState(false);

    // === 加载数据 ===
    useEffect(() => {
        if (!id) return;
        const problemId = Number(id);
        const fetchData = async () => {
            setLoading(true);
            try {
                const [detailRes, collectRes] = await Promise.all([
                    problemApi.get<CommonResp<ProblemDetail>>('/v1/problem/detail', {params: {id: problemId}}),
                    problemApi.get<CommonResp<boolean>>('/v1/problem/getcollect', {params: {id: problemId}})
                ]);

                if (detailRes.data.status === 0 || detailRes.data.status === 200) {
                    const data = detailRes.data.data;
                    setDetail(data);
                    setIsSolved(data.is_solved);
                } else {
                    throw new Error(detailRes.data.msg);
                }

                if (collectRes.data.status === 0 || collectRes.data.status === 200) {
                    setIsCollected(collectRes.data.data);
                }
            } catch (err: any) {
                if (err.response?.status === 401) {
                    // 方案 A: 简单提示
                    setError("请先登录后查看详情");
                    // 方案 B: 如果 App 传了 onShowLogin 回调，可以在这里调用
                    // 但现在我们没有传，所以只能显示错误信息
                } else {
                    setError(err.message || err.response?.data?.msg || "获取数据失败");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // === 交互逻辑 ===
    const handleCollect = async () => {
        if (!id || collecting) return;
        const targetStatus = !isCollected;
        setIsCollected(targetStatus);
        setCollecting(true);
        try {
            await problemApi.post<CommonResp>('/v1/problem/collect', {
                id: Number(id),
                action: targetStatus ? 'add' : 'remove'
            });
        } catch (err) {
            setIsCollected(!targetStatus);
            alert("操作失败");
        } finally {
            setCollecting(false);
        }
    };

    const handleSolve = async () => {
        if (isSolved) return;
        if (!window.confirm("确认已解决？")) return;
        setSolving(true);
        try {
            // @ts-ignore
            const res = await problemApi.post<CommonResp>('/v1/problem/solve', {
                id: detail?.problem_id,
                pid: Number(id)
            });
            if (res.data.status === 0 || res.data.status === 200) {
                alert("打卡成功！");
                setIsSolved(true);
            } else {
                alert(res.data.msg);
            }
        } catch (e) {
            alert("请求失败");
        } finally {
            setSolving(false);
        }
    };

    const handleUserClick = (userId: number) => {
        navigate(`/user/${userId}`);
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500"
                                                                            size={40}/></div>;
    if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;
    if (!detail) return null;

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-12">
            {/* 顶部导航 */}
            <div className="mb-6 mt-2">
                <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition px-2 py-1 rounded-lg hover:bg-gray-100">
                    <ArrowLeft size={20}/> 返回列表
                </button>
            </div>

            {/* 主体卡片 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* 标题头 */}
                <div className="p-8 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/30">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
                            {detail.source || "原创"}
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{detail.title}</h1>
                    </div>
                    {detail.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {detail.tags.split(',').map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 text-xs font-bold rounded-full
                           bg-gray-100 text-gray-600
                           hover:bg-blue-100 hover:text-blue-700 transition"
                                >
                #{tag}
            </span>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span className="text-sm font-medium">发布者</span>
                            <AuthorBadge userId={detail.author_id} onClick={handleUserClick}/>
                        </div>
                        <div
                            className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            <Eye size={14}/> {detail.view_num} 浏览
                        </div>
                        {detail.problem_url && (
                            <a href={detail.problem_url} target="_blank" rel="noreferrer"
                               className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                <ExternalLink size={14}/> 原题链接
                            </a>
                        )}
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="p-8">
                    {/* 题目描述 */}
                    <div className="prose max-w-none mb-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span> 题目内容
                        </h3>

                        {/* ✨✨✨ 2. 使用 MarkdownViewer 替换原来的 div ✨✨✨ */}
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-base min-h-[100px]">
                            <MarkdownViewer content={detail.content || "暂无内容"}/>
                        </div>
                    </div>

                    {/* 参考代码 */}
                    {detail.solution && (
                        <div className="prose max-w-none mb-12">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-500 rounded-full"></span> 参考代码
                            </h3>
                            <div
                                className="bg-[#1e1e1e] text-gray-200 p-6 rounded-2xl font-mono text-sm overflow-x-auto relative shadow-inner border border-gray-800">
                                <div
                                    className="absolute top-3 right-4 text-xs text-gray-500 select-none font-bold opacity-50">SOURCE
                                    CODE
                                </div>
                                <pre className="whitespace-pre font-medium">{detail.solution}</pre>
                            </div>
                        </div>
                    )}

                    {/* 底部操作区 (保持不变) */}
                    <div className="border-t border-gray-100 pt-10 mt-10">
                        <div className="text-center mb-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Challenge
                                Status</h4>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button
                                onClick={handleCollect}
                                disabled={collecting}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all border-2
                                    ${isCollected
                                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700 shadow-sm'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }
                                    ${collecting ? 'opacity-70' : ''}
                                `}
                            >
                                <Star size={20} className={isCollected ? "fill-yellow-500" : ""}/>
                                {isCollected ? "已收藏" : "收藏题目"}
                            </button>

                            <button
                                onClick={handleSolve}
                                disabled={isSolved || solving}
                                className={`
                                    flex items-center gap-2 px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95
                                    ${isSolved
                                    ? 'bg-green-500 hover:bg-green-600 shadow-green-200 cursor-allowed  pointer-events-none'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                }
                                    ${solving ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                {solving ? (
                                    <Loader2 className="animate-spin"/>
                                ) : isSolved ? (
                                    <>
                                        <Trophy size={20} className="fill-white"/> 恭喜！已解决
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={20}/> 标记为已解决
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
