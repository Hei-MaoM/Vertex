import { useEffect, useState } from 'react';
import { X, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { problemApi } from '../lib/api';
import type {ProblemDetail} from '../types';

interface Props {
    problemId: number | null;
    onClose: () => void;
}

export const ProblemDetailModal = ({ problemId, onClose }: Props) => {
    const [detail, setDetail] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!problemId) return;

        const fetchDetail = async () => {
            try {
                setLoading(true);
                setError("");

                // 1. 调用接口
                // 后端返回结构: { Status: 0, Msg: "OK", Data: { ...Detail } }
                const res = await problemApi.get<any>('/v1/problem/detail', {
                    params: { id: problemId }
                });

                console.log("详情页返回数据:", res.data); // 🔍 调试日志

                // 2. 判断状态 (兼容后端大小写，Typescript 定义是小写 status，但实际 JSON 可能是大写 Status)
                // 你的代码返回的是 types.GetProblemDetailResp{ Status: ... }
                // go-zero 默认 JSON tag 是小写，除非你显式改了大写
                // 这里做个全兼容处理
                const status = res.data.status !== undefined ? res.data.status : res.data.Status;
                const data = res.data.data !== undefined ? res.data.data : res.data.Data;
                const msg = res.data.msg || res.data.Msg;

                if (status === 0 || status === 200) {
                    setDetail(data);
                } else {
                    setError(msg || "加载失败");
                }
            } catch (err: any) {
                // 如果是 401，拦截器会刷新页面，这里给个提示
                setError(err.response?.data?.msg || "获取详情失败");
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [problemId]);

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
                <div className="flex-1 overflow-y-auto p-8">
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
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-bold">
                        {detail.source || "原创"}
                      </span>
                                    <h1 className="text-3xl font-black text-gray-900">{detail.title}</h1>

                                    {/* IsSolved 对勾 */}
                                    {detail.is_solved && (
                                        <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                                            <CheckCircle2 size={14} /> 已解决
                                        </div>
                                    )}
                                </div>

                                {/* 原题链接 */}
                                {detail.problem_url && (
                                    <a
                                        href={detail.problem_url.startsWith('http') ? detail.problem_url : `http://${detail.problem_url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-2 bg-blue-50 px-3 py-1 rounded-lg"
                                    >
                                        <ExternalLink size={14}/> 跳转至原题链接
                                    </a>
                                )}
                            </div>

                            {/* 题目内容 */}
                            <div className="prose max-w-none">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">题目内容 / 推荐语</h3>
                                <div className="bg-gray-50 p-6 rounded-xl text-gray-700 whitespace-pre-wrap leading-relaxed border border-gray-100">
                                    {detail.content || "暂无内容"}
                                </div>
                            </div>

                            {/* 题解代码 */}
                            {detail.solution && (
                                <div className="prose max-w-none">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-3">参考代码</h3>
                                    <div className="bg-[#1e1e1e] text-gray-200 p-6 rounded-xl font-mono text-sm overflow-x-auto shadow-inner border border-gray-800 relative group">
                                        <pre className="whitespace-pre">{detail.solution}</pre>
                                        <div className="absolute top-2 right-2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition">Code</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
