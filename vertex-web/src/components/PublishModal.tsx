import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { problemApi } from '../lib/api';
import type {CommonResp, Tag} from '../types';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PublishModal = ({ isOpen, onClose, onSuccess }: PublishModalProps) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // 表单状态
    const [formData, setFormData] = useState({
        problem_url: '',
        problem_title: '',
        problem_source: '原创', // 默认来源
        title: '', // 帖子标题
        content: '',
        solution: '',
        score: 1.0, // 默认难度
        tag_ids: [] as number[]
    });

    // 加载标签列表
    useEffect(() => {
        if (isOpen && tags.length === 0) {
            const fetchTags = async () => {
                try {
                    const res = await problemApi.get<CommonResp<Tag[]>>('/v1/problem/tags');
                    if (res.data.status === 0 || res.data.status === 200) {
                        setTags(res.data.data || []);
                    }
                } catch (e) { console.error("加载标签失败"); }
            };
            fetchTags();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 处理标签选择
    const toggleTag = (id: number) => {
        setFormData(prev => {
            const exists = prev.tag_ids.includes(id);
            return {
                ...prev,
                tag_ids: exists ? prev.tag_ids.filter(tid => tid !== id) : [...prev.tag_ids, id]
            };
        });
    };

    // 提交发布
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await problemApi.post<CommonResp>('/v1/problem/publish', {
                ...formData,
                score: Number(formData.score) // 确保是数字
            });

            if (res.data.status === 0 || res.data.status === 200) {
                alert("发布成功！等待管理员审核。");
                onSuccess();
                onClose();
                // 重置表单(可选)
            } else {
                alert("发布失败: " + res.data.msg);
            }
        } catch (err: any) {
            alert("请求错误: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">分享题目 / 发布题解</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* 原题链接 */}
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">原题链接 (URL)</label>
                            <input name="problem_url" required type="url" placeholder="例如: https://leetcode.cn/problems/..."
                                   className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                   onChange={handleChange} />
                        </div>

                        {/* 原题标题 */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">原题标题</label>
                            <input name="problem_title" required type="text" placeholder="例如: 两数之和"
                                   className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                   onChange={handleChange} />
                        </div>

                        {/* 来源 */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">来源</label>
                            <input name="problem_source" type="text" defaultValue="原创"
                                   className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                   onChange={handleChange} />
                        </div>
                    </div>

                    <hr className="border-gray-100 my-2"/>

                    {/* 帖子标题 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">推荐标题</label>
                        <input name="title" required type="text" placeholder="给你的推荐起个标题..."
                               className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                               onChange={handleChange} />
                    </div>

                    {/* 标签选择 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-2">选择标签</label>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border rounded-lg">
                            {tags.map(tag => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => toggleTag(tag.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition
                    ${formData.tag_ids.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {tag.name}
                                    {formData.tag_ids.includes(tag.id) && <Check size={12} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 推荐理由/内容 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">推荐理由 / 思路</label>
                        <textarea name="content" required rows={4} className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  onChange={handleChange}></textarea>
                    </div>

                    {/* 题解代码 (可选) */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">代码题解 (可选)</label>
                        <textarea name="solution" rows={4} className="w-full mt-1 p-2 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                  onChange={handleChange} placeholder="在此粘贴代码..."></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
                    >
                        {submitting && <Loader2 className="animate-spin" />}
                        发布
                    </button>
                </form>
            </div>
        </div>
    );
};
