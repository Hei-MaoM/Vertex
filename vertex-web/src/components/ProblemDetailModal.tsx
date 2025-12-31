import {useEffect, useState} from 'react';
import {CheckCircle2, ExternalLink, Eye, Loader2, X, XCircle} from 'lucide-react';
import {problemApi} from '../lib/api';
import type {CommonResp, ProblemDetail} from '../types';

interface Props {
    problemId: number | null;
    onClose: () => void;
    // ✨ 新增回调：打卡成功后，通知父组件刷新列表（让列表上的对勾也亮起来）
    onSolveSuccess?: () => void;
}

export const ProblemDetailModal = ({problemId, onClose, onSolveSuccess}: Props) => {
    const [detail, setDetail] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✨ 本地状态：是否已解决 (为了即时更新 UI)
    const [isSolved, setIsSolved] = useState(false);
    const [solving, setSolving] = useState(false);

    useEffect(() => {
        if (!problemId) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await problemApi.get<any>('/v1/problem/detail', {
                    params: { id: problemId }
                });
                const status = res.data.status ?? res.data.Status;
                const data = res.data.data ?? res.data.Data;

                if (status === 0 || status === 200) {
                    setDetail(data);
                    setIsSolved(data.is_solved); // ✨ 初始化状态
                } else {
                    setError(res.data.msg || "加载失败");
                }
            } catch (err: any) {
                setError(err.response?.data?.msg || "获取详情失败，请先登录");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [problemId]);

    // ✨ 打卡逻辑
    const handleSolve = async () => {
        if (isSolved) return; // 已完成的不处理

        if (!window.confirm("恭喜你解决了这道题！确定要标记为“已完成”吗？")) return;

        try {
            setSolving(true);
            // 调用 Solve 接口
            const res = await problemApi.post<CommonResp>('/v1/problem/solve', {
                id: problemId // 传 PostId 给后端
            });

            if (res.data.status === 0 || res.data.status === 200) {
                alert("打卡成功！🎉");
                setIsSolved(true); // 变绿
                if (onSolveSuccess) onSolveSuccess(); // 通知列表刷新
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pb-24">
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
                            {/* Title Area */}
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

                            {/* Body */}
                            <div className="prose max-w-none">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">题目内容</h3>
                                <div className="bg-gray-50 p-6 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                    {detail.content || "暂无内容"}
                                </div>
                            </div>

                            {/* Solution */}
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

                {/* ✨✨✨ 底部固定操作栏 (打卡按钮) ✨✨✨ */}
                {!loading && !error && (
                    <div
                        className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
