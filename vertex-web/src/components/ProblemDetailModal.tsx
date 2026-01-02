import {useEffect, useState} from 'react';
import {CheckCircle2, ExternalLink, Eye, Loader2, Star, X, XCircle} from 'lucide-react';
import {problemApi} from '../lib/api';
// 确保您的 types.ts 里有这些定义
import type {CommonResp, ProblemDetail} from '../types';

interface Props {
    problemId: number | null;
    onClose: () => void;
    // 打卡成功回调，通知父组件刷新列表
    onSolveSuccess?: () => void;
}

export const ProblemDetailModal = ({problemId, onClose, onSolveSuccess}: Props) => {
    // 数据状态
    const [detail, setDetail] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 交互状态
    const [isSolved, setIsSolved] = useState(false);
    const [solving, setSolving] = useState(false);

    // 收藏状态
    const [isCollected, setIsCollected] = useState(false);
    const [collecting, setCollecting] = useState(false);

    // 初始化加载数据
    useEffect(() => {
        if (!problemId) return;

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                // 并行请求：题目详情 + 收藏状态
                // 这样比串行请求更快，且逻辑分离
                const [detailRes, collectRes] = await Promise.all([
                    problemApi.get<CommonResp<ProblemDetail>>('/v1/problem/detail', {
                        params: { id: problemId }
                    }),
                    // 调用您新写的 getCollect 接口
                    problemApi.get<CommonResp<boolean>>('/v1/problem/getcollect', {
                        params: { id: problemId }
                    })
                ]);

                // 1. 处理详情数据
                if (detailRes.data.status === 0 || detailRes.data.status === 200) {
                    // 兼容后端可能返回 Data 或 data
                    const data = detailRes.data.data;
                    setDetail(data);
                    setIsSolved(data.is_solved);
                } else {
                    throw new Error(detailRes.data.msg || "加载题目详情失败");
                }

                // 2. 处理收藏状态
                // 您的后端 Logic 返回 Data: true/false
                if (collectRes.data.status === 0 || collectRes.data.status === 200) {
                    setIsCollected(collectRes.data.data);
                }
                // 如果收藏接口失败（比如未登录状态下可能无法查），这里可以选择忽略或记录日志，
                // 不建议阻断详情页的展示，所以这里不 throw error

            } catch (err: any) {
                console.error("加载数据失败", err);
                setError(err.message || err.response?.data?.msg || "获取数据失败");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [problemId]);

    // 收藏/取消收藏逻辑
    const handleCollect = async () => {
        if (!problemId || collecting) return;

        // 乐观更新：立即在 UI 上切换状态，不用等网络返回
        const targetStatus = !isCollected;
        setIsCollected(targetStatus);
        setCollecting(true);

        try {
            // 根据目标状态决定 action
            const action = targetStatus ? 'add' : 'remove';

            const res = await problemApi.post<CommonResp>('/v1/problem/collect', {
                id: problemId,
                action: action
            });

            if (res.data.status !== 0 && res.data.status !== 200) {
                // 如果后端返回失败，回滚状态
                setIsCollected(!targetStatus);
                alert("收藏操作失败: " + res.data.msg);
            }
        } catch (err: any) {
            // 网络错误，回滚状态
            setIsCollected(!targetStatus);
            console.error("收藏请求失败", err);
            alert("操作失败，请重试");
        } finally {
            setCollecting(false);
        }
    };

    // 打卡逻辑
    const handleSolve = async () => {
        if (isSolved) return;
        if (!window.confirm("恭喜你解决了这道题！确定要标记为“已完成”吗？")) return;

        try {
            setSolving(true);
            const res = await problemApi.post<CommonResp>('/v1/problem/solve', {
                id: problemId
            });

            if (res.data.status === 0 || res.data.status === 200) {
                alert("打卡成功！🎉");
                setIsSolved(true);
                if (onSolveSuccess) onSolveSuccess();
            } else {
                alert("操作失败: " + res.data.msg);
            }
        } catch (err: any) {
            alert("请求错误: " + err.message);
        } finally {
            setSolving(false);
        }
    };

    if (!problemId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        题目详情 #{problemId}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 pb-24 scrollbar-thin scrollbar-thumb-gray-200">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
                        </div>
                    ) : error ? (
                        <div className="h-full flex flex-col items-center justify-center text-red-500 gap-2">
                            <span className="font-bold text-xl">⚠️ 无法查看</span>
                            <p>{error}</p>
                        </div>
                    ) : detail && (
                        <div className="space-y-8">
                            {/* Title & Metadata */}
                            <div>
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold">
                                        {detail.source || "原创"}
                                    </span>
                                    <h1 className="text-3xl font-black text-gray-900">{detail.title}</h1>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                        <Eye size={14}/>
                                        <span>{detail.view_num || 0} 次浏览</span>
                                    </div>
                                    {detail.problem_url && (
                                        <a
                                            href={detail.problem_url.startsWith('http') ? detail.problem_url : `http://${detail.problem_url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-blue-600 hover:underline"
                                        >
                                            <ExternalLink size={14}/> 原题链接
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Problem Content */}
                            <div className="prose max-w-none">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">题目内容</h3>
                                <div className="bg-gray-50 p-6 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                    {detail.content || "暂无内容"}
                                </div>
                            </div>

                            {/* Solution Code */}
                            {detail.solution && (
                                <div className="prose max-w-none">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-3">参考代码</h3>
                                    <div className="bg-[#1e1e1e] text-gray-200 p-6 rounded-xl font-mono text-sm overflow-x-auto shadow-inner border border-gray-800 relative group">
                                        <pre className="whitespace-pre">{detail.solution}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                {!loading && !error && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">

                        {/* 左侧：收藏按钮 */}
                        <button
                            onClick={handleCollect}
                            disabled={collecting}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
                                ${isCollected
                                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }
                                ${collecting ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            <Star
                                size={20}
                                className={isCollected ? "fill-yellow-500" : ""}
                            />
                            {isCollected ? "已收藏" : "收藏"}
                        </button>

                        {/* 右侧：打卡按钮 */}
                        <button
                            onClick={handleSolve}
                            disabled={isSolved || solving}
                            className={`
                                px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition shadow-sm
                                ${isSolved
                                ? 'bg-green-100 text-green-700 cursor-default border border-green-200'
                                : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                            }
                                ${solving ? 'opacity-70 cursor-wait' : ''}
                            `}
                        >
                            {solving ? (
                                <Loader2 className="animate-spin" size={20}/>
                            ) : isSolved ? (
                                <>
                                    <CheckCircle2 size={20}/> 已解决
                                </>
                            ) : (
                                <>
                                    <XCircle size={20}/> 标记为已解决
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
