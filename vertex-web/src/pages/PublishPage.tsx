import React, {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowLeft, Check, Code2, Edit3, Eye, Loader2, Plus, X} from 'lucide-react';
import {problemApi} from '../lib/api';
import type {CommonResp, Tag} from '../types';

// ✨✨✨ 引入 Markdown 渲染组件 ✨✨✨
import {MarkdownViewer} from '../components/MarkdownViewer';

// ✨✨✨ 引入代码编辑器及高亮 ✨✨✨
import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/themes/prism.css'; // 基础样式

export const PublishPage = () => {
    const navigate = useNavigate();

    // === 状态定义 ===
    const [tags, setTags] = useState<Tag[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    // ✨ 交互状态
    const [previewMode, setPreviewMode] = useState(false); // Markdown 预览模式
    const [codeLang, setCodeLang] = useState('go'); // 代码语言

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

    // === 加载标签 ===
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await problemApi.get<CommonResp<Tag[]>>('/v1/problem/tags');
                if (res.data.status === 0 || res.data.status === 200) {
                    const loadedTags = res.data.data || [];
                    setTags(loadedTags);
                    if (loadedTags.length > 0) setActiveCategory(loadedTags[0].category);
                }
            } catch (e) {
                console.error("加载标签失败");
            }
        };
        fetchTags();
    }, []);

    // === 标签分组逻辑 ===
    const groupedTags = useMemo(() => {
        const groups: Record<string, Tag[]> = {};
        tags.forEach(tag => {
            if (!groups[tag.category]) groups[tag.category] = [];
            groups[tag.category].push(tag);
        });
        return groups;
    }, [tags]);
    const categories = Object.keys(groupedTags);

    // === 交互逻辑 ===
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const toggleTag = (id: number) => {
        setFormData(prev => {
            const exists = prev.tag_ids.includes(id);
            return {
                ...prev,
                tag_ids: exists ? prev.tag_ids.filter(tid => tid !== id) : [...prev.tag_ids, id]
            };
        });
    };

    // === 提交逻辑 ===
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        if (!formData.problem_title) return alert("请填写原题标题");
        if (!formData.title) return alert("请填写推荐标题");
        if (!formData.content) return alert("请填写推荐理由");

        setSubmitting(true);
        try {
            const res = await problemApi.post<CommonResp>('/v1/problem/publish', {
                ...formData,
                score: Number(formData.score)
            });

            if (res.data.status === 0 || res.data.status === 200) {
                alert("发布成功！等待管理员审核。");
                navigate('/');
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
        <div className="max-w-4xl mx-auto animate-in fade-in duration-300 pb-20">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium"
                >
                    <ArrowLeft size={20}/> 取消发布
                </button>
                <h1 className="text-xl font-bold text-gray-800">分享题目 / 发布题解</h1>
                <div className="w-20"></div>
            </div>

            {/* 主体表单 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Section 1: 原题信息 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">1.
                            原题信息</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">原题链接 (URL)</label>
                                <input name="problem_url" required type="url"
                                       placeholder="https://leetcode.cn/problems/..."
                                       className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                       onChange={handleChange}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">原题标题 <span
                                    className="text-red-500">*</span></label>
                                <input name="problem_title" required type="text" placeholder="例如: 两数之和"
                                       className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                       onChange={handleChange}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">来源平台</label>
                                <input name="problem_source" type="text" defaultValue="原创"
                                       className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
                                       onChange={handleChange}/>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: 推荐内容 */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">2.
                            推荐内容</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">推荐标题 <span
                                className="text-red-500">*</span></label>
                            <input name="title" required type="text" placeholder="给你的推荐起个响亮的标题..."
                                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-bold text-lg"
                                   onChange={handleChange}/>
                        </div>

                        {/* 标签选择器 */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">选择标签</label>
                            {/* 已选标签 */}
                            <div
                                className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                                {formData.tag_ids.length === 0 &&
                                    <span className="text-sm text-gray-400 self-center pl-2">暂未选择标签...</span>}
                                {formData.tag_ids.map(id => {
                                    const tag = tags.find(t => t.id === id);
                                    if (!tag) return null;
                                    return (
                                        <button key={id} type="button" onClick={() => toggleTag(id)}
                                                className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 hover:border-red-300 hover:text-red-500 transition shadow-sm">
                                            {tag.name} <X size={12}/>
                                        </button>
                                    );
                                })}
                            </div>
                            {/* 分类 Tabs */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto">
                                    {categories.map(cat => (
                                        <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                                                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeCategory === cat ? 'bg-white text-blue-600 border-blue-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-4 bg-white min-h-[120px]">
                                    <div className="flex flex-wrap gap-2">
                                        {activeCategory && groupedTags[activeCategory]?.map(tag => {
                                            const isSelected = formData.tag_ids.includes(tag.id);
                                            return (
                                                <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm border transition flex items-center gap-1.5 ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
                                                    {isSelected ? <Check size={14}/> : <Plus size={14}/>} {tag.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ✨✨✨ 推荐理由 (Tab 切换预览) ✨✨✨ */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">推荐理由 / 思路 <span
                                    className="text-red-500">*</span></label>
                                <div className="flex bg-gray-100 p-1 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(false)}
                                        className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${!previewMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Edit3 size={12}/> 编辑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewMode(true)}
                                        className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition ${previewMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <Eye size={12}/> 预览
                                    </button>
                                </div>
                            </div>

                            {previewMode ? (
                                <div className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[200px]">
                                    {formData.content ? <MarkdownViewer content={formData.content}/> :
                                        <span className="text-gray-400 text-sm">暂无内容可预览...</span>}
                                </div>
                            ) : (
                                <textarea name="content" required rows={8}
                                          className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition font-mono text-sm"
                                          onChange={handleChange} value={formData.content}
                                          placeholder="支持 Markdown 格式。例如：&#10;## 解题思路&#10;我们可以使用**二分查找**..."></textarea>
                            )}
                        </div>

                        {/* ✨✨✨ 代码编辑器 (高亮) ✨✨✨ */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Code2 size={16}/> 代码题解 (可选)
                                </label>
                                <select
                                    value={codeLang}
                                    onChange={(e) => setCodeLang(e.target.value)}
                                    className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:border-blue-400"
                                >
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                    <option value="python">Python</option>
                                </select>
                            </div>

                            <div
                                className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition">
                                <Editor
                                    value={formData.solution}
                                    onValueChange={code => setFormData({...formData, solution: code})}
                                    highlight={code => highlight(code, languages[codeLang] || languages.go, codeLang)}
                                    padding={16}
                                    className="font-mono text-sm bg-[#fafafa]"
                                    style={{
                                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                                        fontSize: 14,
                                        minHeight: '200px'
                                    }}
                                    placeholder="在此粘贴代码..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting && <Loader2 className="animate-spin" size={20}/>}
                            发布帖子
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
