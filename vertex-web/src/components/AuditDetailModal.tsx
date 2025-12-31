import {useEffect, useState} from 'react';
import {Check, Loader2, X, X as XIcon} from 'lucide-react';
import {problemApi} from '../lib/api';
import type {CommonResp, ProblemDetail} from '../types';

interface Props {
    problemId: number | null;
    onClose: () => void;
    onSuccess: () => void; // 审核成功后回调
}

export const AuditDetailModal = ({problemId, onClose, onSuccess}: Props) => {
    const [detail, setDetail] = useState<ProblemDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!problemId) return;
        const fetchDetail = async () => {
            try {
                setLoading(true);
                // 复用详情接口
                const res = await problemApi.get<any>('/v1/problem/detail', {params: {id: problemId}});
                const status = res.data.status ?? res.data.Status;
                if (status === 0 || status === 200) {
                    setDetail(res.data.data ?? res.data.Data);
                } else {
                    setError(res.data.msg || "加载失败");
                }
            } catch (err: any) {
                setError("获取失败");
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [problemId]);

    const handleAudit = async (status: number) => {
        if (!window.confirm(status === 1 ? "确定通过?" : "确定拒绝?")) return;
        try {
            const res = await problemApi.post<CommonResp>('/v1/problem/audit', {
                post_id: problemId,
                status: status,
                fix_problem_title: ""
            });
            if (res.data.status === 0 || res.data.status === 200) {
                alert("审核完成");
                onSuccess(); // 通知刷新列表
                onClose();   // 关闭弹窗
            } else {
                alert("操作失败: " + res.data.msg);
            }
        } catch (err) {
            alert("请求错误");
        }
    };

    if (!problemId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl relative flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-orange-100">

                {/* Header - 橙色背景提示这是审核模式 */}
                <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50">
                    <h2 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                        🛡️ 审核模式 - ID #{problemId}
                    </h2>
                    <button onClick={onClose}><X size={20} className="text-orange-400 hover:text-orange-600"/></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pb-24 bg-gray-50">
                    {loading ? <Loader2 className="animate-spin mx-auto text-orange-500"/> : error ?
                        <div className="text-center text-red-500">{error}</div> : detail && (
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h1 className="text-2xl font-bold mb-2">{detail.title}</h1>
                                <div className="text-sm text-gray-500">来源: {detail.source} | 原题: <a
                                    href={detail.problem_url} target="_blank"
                                    className="text-blue-500 underline">{detail.problem_url}</a></div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold mb-4 border-l-4 border-blue-500 pl-3">内容</h3>
                                <div className="whitespace-pre-wrap text-gray-700">{detail.content}</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold mb-4 border-l-4 border-green-500 pl-3">代码</h3>
                                <pre
                                    className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{detail.solution}</pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* 底部固定操作栏 */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-end gap-4 shadow-lg">
                    <button onClick={() => handleAudit(2)}
                            className="px-6 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold flex gap-2">
                        <XIcon/> 拒绝
                    </button>
                    <button onClick={() => handleAudit(1)}
                            className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-bold flex gap-2 shadow-md">
                        <Check/> 通过发布
                    </button>
                </div>
            </div>
        </div>
    );
};
