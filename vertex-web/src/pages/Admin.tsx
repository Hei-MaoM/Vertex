import {useState} from 'react';
import {AdminProblemAudit} from '../components/AdminProblemAudit';
import {AdminUserManage} from '../components/AdminUserManage';
import {ListTodo, Users} from 'lucide-react';
import type {User} from '../types';

interface Props {
    currentUser: User | null;
    onReview: (id: number) => void;
}

export const Admin = ({currentUser, onReview}: Props) => {
    const [adminTab, setAdminTab] = useState<'audit' | 'users'>('audit');

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="hidden md:block md:col-span-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-24 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50">
                        <h3 className="font-bold text-gray-800">Admin Console</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            {currentUser?.authority === 3 ? "超级管理员权限" : "管理员权限"}
                        </p>
                    </div>
                    <nav className="p-2 space-y-1">
                        <button onClick={() => setAdminTab('audit')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'audit' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <ListTodo size={18} /> 题目审核
                        </button>
                        {currentUser?.authority && currentUser.authority >= 2 && (
                            <button onClick={() => setAdminTab('users')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${adminTab === 'users' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <Users size={18} /> 用户管理
                            </button>
                        )}
                    </nav>
                </div>
            </aside>
            <section className="col-span-1 md:col-span-9">
                {adminTab === 'audit' && <AdminProblemAudit onReview={onReview} />}
                {adminTab === 'users' && currentUser && currentUser.authority >= 2 && <AdminUserManage currentUser={currentUser} />}
            </section>
        </div>
    );
};
