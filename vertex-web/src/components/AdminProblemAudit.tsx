import {useEffect, useState} from 'react';
import type {ProblemPost} from '../types';
import {problemApi} from '../lib/api';
import {AlertCircle, Eye, Loader2} from 'lucide-react';

interface Props {
    onReview: (id: number) => void;
}

export const AdminProblemAudit = ({onReview}: Props) => {
    const [auditList, setAuditList] = useState<ProblemPost[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAuditList = async () => {
        try {
            setLoading(true);
            const res = await problemApi.get<any>('/v1/problem/auditlist', {
                params: {page: 1, page_size: 50}
            });
            if (res.data.status === 0 || res.data.status === 200) {
                setAuditList(res.data.data || []);
            } else {
                setAuditList([]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditList();
    }, []);

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500"/>
    </div>;

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <AlertCircle className="text-orange-500"/> 待审核队列
                    <span
                        className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">{auditList.length}</span>
                </h2>
                <button onClick={fetchAuditList} className="text-sm text-blue-600 hover:underline">刷新列表</button>
            </div>
            {/* 表格代码保持不变 */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                    <tr>
                        <th className="px-6 py-4 font-medium">ID</th>
                        <th className="px-6 py-4 font-medium">标题</th>
                        <th className="px-6 py-4 font-medium">来源</th>
                        <th className="px-6 py-4 font-medium text-right">操作</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {auditList.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-400">暂无待审核题目</td>
                        </tr>
                    ) : (
                        auditList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-gray-500">#{item.id}</td>
                                <td className="px-6 py-4 font-medium text-gray-800">{item.title}</td>
                                <td className="px-6 py-4"><span
                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">{item.source}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onReview(item.id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 justify-end ml-auto">
                                        <Eye size={16}/> 审核
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
