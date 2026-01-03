import {useEffect, useState} from 'react';
import {CheckCircle2, ExternalLink, Eye, Loader2, Star, X, XCircle} from 'lucide-react';
import {problemApi} from '../lib/api';
// 确保 AuthorBadge 在同一目录下，或者根据您的实际路径修改 import
import {AuthorBadge} from './AuthorBadge';
import type {CommonResp, ProblemDetail} from '../types';
import {MarkdownViewer} from './MarkdownViewer.tsx';

interface Props {
    problemId: number | null;
    onClose: () => void;
    // 打卡成功回调，通知父组件刷新列表
    onSolveSuccess?: () => void;
    onUserClick?: (id: number) => void;
}


export const ProblemDetailModal = ({problemId, onClose, onSolveSuccess, onUserClick}: Props) => {
    // === 数据状态 ===
    const [detail, setDetail] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // === 交互状态 ===
    const [isSolved, setIsSolved] = useState(false);
    const [solving, setSolving] = useState(false);

    // === 收藏状态 ===
    const [isCollected, setIsCollected] = useState(false);
    const [collecting, setCollecting] = useState(false);

    // === 初始化加载数据 ===
    useEffect(() => {
        if (!problemId) return;

        const fetchData = async () => {
            setLoading(true);
            setError("");

            try {
                // ✨ 并行请求：题目详情 + 收藏状态
                // 使用 Promise.all 同时发起两个请求，提升加载速度
                const [detailRes, collectRes] = await Promise.all([
                    // 1. 获取题目详情
                    problemApi.get<CommonResp<ProblemDetail>>('/v1/problem/detail', {
                        params: {id: problemId}
                    }),
                    // 2. 获取收藏状态 (注意 URL 大小写需与后端 API 定义一致)
                    problemApi.get<CommonResp<boolean>>('/v1/problem/getcollect', {
                        params: {id: problemId}
                    })
                ]);

                // 处理详情响应
                if (detailRes.data.status === 0 || detailRes.data.status === 200) {
                    const data = detailRes.data.data;
                    setDetail(data);
                    setIsSolved(data.is_solved);
                } else {
                    throw new Error(detailRes.data.msg || "加载题目详情失败");
                }

                // 处理收藏状态响应
                if (collectRes.data.status === 0 || collectRes.data.status === 200) {
                    setIsCollected(collectRes.data.data);
                }

            } catch (err: any) {
                console.error("加载数据失败", err);
                setError(err.message || err.response?.data?.msg || "获取数据失败");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [problemId]);

    // === 收藏/取消收藏逻辑 ===
    const handleCollect = async () => {
        if (!problemId || collecting) return;

        // 乐观更新：立即在 UI 上切换状态
        const targetStatus = !isCollected;
        setIsCollected(targetStatus);
        setCollecting(true);

        try {
            const action = targetStatus ? 'add' : 'remove';
            const res = await problemApi.post<CommonResp>('/v1/problem/collect', {
                id: problemId,
                action: action
            });

            if (res.data.status !== 0 && res.data.status !== 200) {
                // 失败回滚
                setIsCollected(!targetStatus);
                alert("收藏操作失败: " + res.data.msg);
            }
        } catch (err: any) {
            // 错误回滚
            setIsCollected(!targetStatus);
            console.error("收藏请求失败", err);
            alert("操作失败，请重试");
        } finally {
            setCollecting(false);
        }
    };

    // === 打卡逻辑 ===
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
                        <div className="space-y-6">

                            {/* Title & Author Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                    <span
                                        className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold self-start mt-1">
                                        {detail.source || "原创"}
                                    </span>
                                    <h1 className="text-3xl font-black text-gray-900 leading-tight">
                                        {detail.title}
                                    </h1>
                                </div>

                                {/* ✨✨✨ 作者信息栏 ✨✨✨ */}
                                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                    {/* 作者徽章 */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">发布者</span>
                                        {/* 使用 AuthorBadge 组件 */}
                                        <AuthorBadge userId={detail.author_id} onClick={onUserClick}/>
                                    </div>

                                    {/* 浏览量 */}
                                    <div
                                        className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                        <Eye size={14}/>
                                        <span>{detail.view_num || 0} 浏览</span>
                                    </div>

                                    {/* 原题链接 */}
                                    {detail.problem_url && (
                                        <a
                                            href={detail.problem_url.startsWith('http') ? detail.problem_url : `http://${detail.problem_url}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
                                        >
                                            <ExternalLink size={14}/>
                                            <span className="hidden sm:inline">跳转原题</span>
                                            <span className="sm:hidden">原题</span>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Problem Content */}
                            <div className="prose max-w-none mb-10">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-500 rounded-full"></span> 题目内容
                                </h3>

                                {/* ✨✨✨ 使用 MarkdownViewer 渲染内容 ✨✨✨ */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 min-h-[100px]">
                                    <MarkdownViewer content={detail.content || "暂无内容"}/>
                                </div>
                            </div>
                            {/* Solution Code */}
                            {detail.solution && (
                                <div className="prose max-w-none pt-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                        参考代码
                                    </h3>
                                    <div className="bg-[#1e1e1e] text-gray-200 p-6 rounded-xl font-mono text-sm overflow-x-auto shadow-inner border border-gray-800 relative group">
                                        <div className="absolute top-2 right-4 text-xs text-gray-500 select-none">CODE
                                        </div>
                                        <pre className="whitespace-pre">{detail.solution}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Action Bar */}
                {!loading && !error && (
                    <div
                        className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        {/* 左侧：收藏按钮 */}
                        <button
                            onClick={handleCollect}
                            disabled={collecting}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isCollected ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'} ${collecting ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            <Star size={20} className={isCollected ? "fill-yellow-500" : ""}/>
                            {isCollected ? "已收藏" : "收藏"}
                        </button>

                        {/* 右侧：打卡按钮 */}
                        <button
                            onClick={handleSolve}
                            disabled={isSolved || solving}
                            className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition shadow-sm ${isSolved ? 'bg-green-100 text-green-700 cursor-default border border-green-200' : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'} ${solving ? 'opacity-70 cursor-wait' : ''}`}
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
