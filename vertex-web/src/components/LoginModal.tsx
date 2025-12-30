import React, {useEffect, useState} from 'react';
import {KeyRound, Loader2, Lock, Mail, User, X} from 'lucide-react';
import {userApi} from '../lib/api';
import type {CommonResp, LoginData} from '../types';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export const LoginModal = ({isOpen, onClose}: LoginModalProps) => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({user_name: '', password: '', email: '', code: ''});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSendCode = async () => {
        if (!formData.email || !formData.email.includes('@')) {
            setErrorMsg("请输入有效的邮箱地址");
            return;
        }
        try {
            setErrorMsg('');
            const res = await userApi.post<CommonResp>('/v1/user/send_email', {
                email: formData.email,
                operation_type: 1
            });
            if (res.data.status === 0) {
                setCountdown(60);
                alert(`验证码已发送至 ${formData.email}`);
            } else {
                setErrorMsg(res.data.msg || "发送失败");
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.msg || "网络请求错误");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            if (isRegister) {
                // === 注册 ===
                const res = await userApi.post<CommonResp>('/v1/user/register', {
                    user_name: formData.user_name,
                    password: formData.password,
                    email: formData.email,
                    code: formData.code
                });
                if (res.data.status === 0 || res.data.status == 200) {
                    alert('注册成功，请登录');
                    setIsRegister(false);
                    setFormData({...formData, password: '', code: ''});
                } else {
                    setErrorMsg(res.data.msg);
                }
            } else {
                // === 登录 ===
                const res = await userApi.post<CommonResp<LoginData>>('/v1/user/login', {
                    user_name: formData.user_name,
                    password: formData.password
                });

                if (res.data.status === 0 || res.data.status == 200) {
                    const tokenData = res.data.data;
                    if (tokenData && tokenData.token) {
                        localStorage.setItem('jwt_token', tokenData.token);
                        // ⚠️ 登录成功后直接刷新页面，这是最稳妥的更新UI方式
                        window.location.reload();
                    } else {
                        setErrorMsg('登录异常：未获取到Token');
                    }
                } else {
                    setErrorMsg(res.data.msg || '登录失败');
                }
            }
        } catch (err: any) {
            setErrorMsg(err.response?.data?.msg || '请求失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20}/>
                </button>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    {isRegister ? '加入 Vertex' : '欢迎回来'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                        <input name="user_name" type="text" placeholder="用户名" required
                               className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                               onChange={handleChange}/>
                    </div>
                    {isRegister && (
                        <>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                                <input name="email" type="email" placeholder="邮箱" required
                                       className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                       onChange={handleChange}/>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <KeyRound className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                                    <input name="code" type="text" placeholder="验证码" required
                                           className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                           onChange={handleChange}/>
                                </div>
                                <button type="button" onClick={handleSendCode} disabled={countdown > 0}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${countdown > 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                </button>
                            </div>
                        </>
                    )}
                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={18}/>
                        <input name="password" type="password" placeholder="密码" required
                               className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                               onChange={handleChange}/>
                    </div>
                    {errorMsg &&
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">{errorMsg}</div>}
                    <button type="submit" disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                        {loading && <Loader2 className="animate-spin" size={18}/>}
                        {loading ? '处理中...' : (isRegister ? '立即注册' : '登 录')}
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    <button onClick={() => {
                        setIsRegister(!isRegister);
                        setErrorMsg('');
                    }} className="text-blue-600 font-semibold hover:underline">
                        {isRegister ? '去登录' : '去注册'}
                    </button>
                </div>
            </div>
        </div>
    );
};
