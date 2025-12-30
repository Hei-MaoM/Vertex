import React, {useState} from 'react';
import {Loader2, Upload, User as UserIcon, X} from 'lucide-react';
import {userApi} from '../lib/api';
import {uploadToQiniu} from '../lib/upload';
import type {CommonResp} from '../types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // 修改成功后回调
    currentUser: { username: string; avatar: string }; // 传入当前信息用于回显
}

export const EditProfileModal = ({isOpen, onClose, onSuccess, currentUser}: EditProfileModalProps) => {
    const [nickname, setNickname] = useState(currentUser.username);
    const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // 处理文件选择
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setLoading(true);
            // 调用七牛上传
            const url = await uploadToQiniu(file);
            setAvatarUrl(url); // 预览更新
        } catch (err: any) {
            alert("图片上传失败: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // 提交修改
    const handleSubmit = async () => {
        try {
            setLoading(true);
            // 调用后端 UpdateInfo 接口
            const res = await userApi.post<CommonResp>('/v1/user/updateinfo', {
                nickname: nickname,
                avatar: avatarUrl
            });

            if (res.data.status === 0 || res.data.status === 200) {
                alert("修改成功！");
                onSuccess(); // 触发父组件刷新
                onClose();
            } else {
                alert("修改失败: " + res.data.msg);
            }
        } catch (err) {
            console.error(err);
            alert("网络请求失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20}/>
                </button>
                <h2 className="text-xl font-bold mb-6 text-gray-800">编辑个人资料</h2>

                <div className="space-y-6">
                    {/* 头像上传区 */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <img
                                src={avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Vertex"}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover"
                            />
                            <label
                                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                                <Upload className="text-white" size={24}/>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
                            </label>
                        </div>
                        <p className="text-xs text-gray-400">点击头像上传新图片</p>
                    </div>

                    {/* 昵称输入 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={18}/>}
                        保存修改
                    </button>
                </div>
            </div>
        </div>
    );
};
