import React, {useEffect, useMemo, useState} from 'react';
import {Check, Loader2, X, Plus} from 'lucide-react'; // 引入 Plus 图标
import {problemApi} from '../lib/api';
import type {CommonResp, Tag} from '../types';

interface PublishModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PublishModal = ({isOpen, onClose, onSuccess}: PublishModalProps) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // ✨ 新增状态：当前选中的分类
    const [activeCategory, setActiveCategory] = useState<string>("");

    const [formData, setFormData] = useState({
        problem_url: '',
        problem_title: '',
        problem_source: '原创',
        title: '',
        content: '',
        solution: '',
        score: 1.0,
        tag_ids: [] as number[]
    });

    // 加载标签
    useEffect(() => {
        if (isOpen && tags.length === 0) {
            const fetchTags = async () => {
                try {
                    const res = await problemApi.get<CommonResp<Tag[]>>('/v1/problem/tags');
                    if (res.data.status === 0 || res.data.status === 200) {
                        const loadedTags = res.data.data || [];
                        setTags(loadedTags);
                        // ✨ 默认选中第一个分类
                        if (loadedTags.length > 0) {
                            setActiveCategory(loadedTags[0].category);
                        }
                    }
                } catch (e) {
                    console.error("加载标签失败");
                }
            };
            fetchTags();
        }
    }, [isOpen]);

    // ✨✨✨ 核心逻辑：按 Category 分组 ✨✨✨
    const groupedTags = useMemo(() => {
        const groups: Record<string, Tag[]> = {};
        tags.forEach(tag => {
            if (!groups[tag.category]) {
                groups[tag.category] = [];
            }
            groups[tag.category].push(tag);
        });
        return groups;
    }, [tags]);

    // 获取所有分类名称
    const categories = Object.keys(groupedTags);

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // 切换标签选中状态
    const toggleTag = (id: number) => {
        setFormData(prev => {
            const exists = prev.tag_ids.includes(id);
            return {
                ...prev,
                tag_ids: exists ? prev.tag_ids.filter(tid => tid !== id) : [...prev.tag_ids, id]
            };
        });
    };

    // 提交逻辑
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await problemApi.post<CommonResp>('/v1/problem/publish', {
                ...formData,
                score: Number(formData.score)
            });

            if (res.data.status === 0 || res.data.status === 200) {
                alert("发布成功！等待管理员审核。");
                onSuccess();
                onClose();
            } else {
                alert("发布失败: " + res.data.msg);
            }
        } catch (err: any) {
            alert("请求错误: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20}/>
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">分享题目 / 发布题解</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ... (上部分表单保持不变: URL, 标题, 来源) ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">原题链接 (URL)</label>
                            <input name="problem_url" required type="url" placeholder="例如: https://leetcode.cn/problems/..."
                                   className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                   onChange={handleChange}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">原题标题</label>
                            <input name="problem_title" required type="text" placeholder="例如: 两数之和"
                                   className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                   onChange={handleChange}/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">来源</label>
                            <input name="problem_source" type="text" defaultValue="原创"
                                   className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                   onChange={handleChange}/>
                        </div>
                    </div>

                    <hr className="border-gray-100"/>

                    <div>
                        <label className="text-sm font-medium text-gray-700">推荐标题</label>
                        <input name="title" required type="text" placeholder="给你的推荐起个标题..."
                               className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                               onChange={handleChange}/>
                    </div>

                    {/* ✨✨✨ 全新设计的标签选择区域 ✨✨✨ */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">选择标签</label>

                        {/* 1. 已选中的标签展示区 (Selected Chips) */}
                        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                            {formData.tag_ids.length === 0 && (
                                <span className="text-sm text-gray-400 self-center pl-1">暂未选择标签...</span>
                            )}
                            {formData.tag_ids.map(id => {
                                const tag = tags.find(t => t.id === id);
                                if (!tag) return null;
                                return (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => toggleTag(id)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 transition"
                                    >
                                        {tag.name}
                                        <X size={12} className="text-gray-500" />
                                    </button>
                                );
                            })}
                        </div>

                        {/* 2. 标签选择器面板 */}
                        <div className="border rounded-lg overflow-hidden">
                            {/* Level 1: 分类 Tabs */}
                            <div className="flex bg-gray-50 border-b overflow-x-auto scrollbar-hide">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors
                                            ${activeCategory === cat
                                            ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Level 2: 具体标签池 */}
                            <div className="p-3 bg-white min-h-[100px]">
                                <div className="flex flex-wrap gap-2">
                                    {activeCategory && groupedTags[activeCategory]?.map(tag => {
                                        const isSelected = formData.tag_ids.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTag(tag.id)}
                                                className={`px-3 py-1.5 rounded text-sm border transition flex items-center gap-1.5
                                                    ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                    : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                                }`}
                                            >
                                                {isSelected ? <Check size={14} /> : <Plus size={14} />}
                                                {tag.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ... (下部分表单保持不变: 内容, 代码) ... */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">推荐理由 / 思路</label>
                        <textarea name="content" required rows={4}
                                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  onChange={handleChange}></textarea>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">代码题解 (可选)</label>
                        <textarea name="solution" rows={4}
                                  className="w-full mt-1 p-2 border rounded-lg font-mono text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                  onChange={handleChange} placeholder="在此粘贴代码..."></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
                    >
                        {submitting && <Loader2 className="animate-spin"/>}
                        发布
                    </button>
                </form>
            </div>
        </div>
    );
};
