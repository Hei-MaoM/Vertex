import { useState, useEffect } from 'react';
import type {ProblemPost, CommonResp} from '../types';
import { problemApi } from '../lib/api'; // 使用 problemApi (8082)
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';

export const AdminAudit = () => {
    const [auditList, setAuditList] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);

    // 获取待审核列表
    const fetchAuditList = async () => {
        try {
            setLoading(true);
            const res = await problemApi.get<CommonResp<ProblemPost[]>>('/v1/problem/auditlist', {
                params: { page: 1, page_size: 50 }
            });

            console.log("审核列表原始数据:", res.data);

            // ✅ 修正取值逻辑
            if (res.data.status === 200) {
                // 直接使用 res.data.data，因为它就是数组
                const list = res.data.data || [];
                setAuditList(list);
            } else {
                setAuditList([]);
            }
        } catch (err) {
            console.error("获取审核列表失败:", err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchAuditList();
    }, []);

    // 提交审核结果
    const handleAudit = async (id: number, status: number) => {
        const actionText = status === 1 ? "通过" : "拒绝";
        if (!window.confirm(`确定要 [${actionText}] 题目 ID:${id} 吗？`)) {
            return;
        }

        try {
            // 调用 POST /v1/problem/audit
            const res = await problemApi.post<CommonResp>('/v1/problem/audit', {
                post_id: id,
                status: status,
                fix_problem_title: "" // 这里暂时留空，如果需要修改标题可以在UI加输入框
            });

            if (res.data.status === 0) {
                alert("操作成功");
                // 成功后，从列表中移除该项
                setAuditList(prev => prev.filter(item => item.id !== id));
            } else {
                alert(`操作失败: ${res.data.msg}`);
            }
        } catch (err: any) {
            alert(`请求错误: ${err.response?.data?.msg || err.message}`);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="text-orange-500" />
                    待审核队列
                    <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
            {auditList.length}
          </span>
                </h2>
                <button onClick={fetchAuditList} className="text-sm text-blue-600 hover:underline">刷新列表</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                    <tr>
                        <th className="px-6 py-4 font-medium">ID</th>
                        <th className="px-6 py-4 font-medium">标题</th>
                        <th className="px-6 py-4 font-medium">来源</th>
                        <th className="px-6 py-4 font-medium">标签</th>
                        <th className="px-6 py-4 font-medium text-right">操作</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {auditList.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                🎉 目前没有待审核的题目
                            </td>
                        </tr>
                    ) : (
                        auditList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500">#{item.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
                                <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {item.source}
                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                        {(item.tags || []).map(t => (
                                            <span key={t.id} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {t.name}
                        </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                                    <button
                                        onClick={() => handleAudit(item.id, 1)}
                                        className="text-green-500 hover:text-green-700 p-2 bg-green-50 rounded border border-transparent hover:border-green-200 transition"
                                        title="通过"
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleAudit(item.id, 2)}
                                        className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded border border-transparent hover:border-red-200 transition"
                                        title="拒绝"
                                    >
                                        <X size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
