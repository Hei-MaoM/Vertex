import { useState } from 'react';
import { UserCard } from './components/UserCard';
import { ProblemFeed } from './components/ProblemFeed';
import { AdminAudit } from './components/AdminAudit';
import { LoginModal } from './components/LoginModal';
import { EditProfileModal } from './components/EditProfileModal';
import { PublishModal } from './components/PublishModal';
import { ProblemDetailModal } from './components/ProblemDetailModal'; // 新增
import { Search, ShieldCheck, LayoutGrid, Plus } from 'lucide-react';
import type {User} from './types';

function App() {
    const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
    const [showLogin, setShowLogin] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPublish, setShowPublish] = useState(false);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null); // 新增

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [userAuthority, setUserAuthority] = useState<number>(0);

    const hasToken = !!localStorage.getItem('jwt_token');
    const handleRefresh = () => setRefreshTrigger(p => p + 1);

    // 点击题目列表项
    const handleProblemClick = (id: number) => {
        if (!hasToken) {
            setShowLogin(true); // 没登录 -> 弹登录窗
        } else {
            setSelectedProblemId(id); // 登录了 -> 弹详情窗
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLoginSuccess={handleRefresh} />

            {editingUser && (
                <EditProfileModal
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    onSuccess={handleRefresh}
                    currentUser={editingUser}
                />
            )}

            <PublishModal isOpen={showPublish} onClose={() => setShowPublish(false)} onSuccess={handleRefresh} />

            {/* 详情模态框 */}
            <ProblemDetailModal
                problemId={selectedProblemId}
                onClose={() => setSelectedProblemId(null)}
            />

            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-black text-blue-600 cursor-pointer" onClick={() => setCurrentPage('home')}>Vertex</span>
                        <div className="hidden md:flex gap-6 text-gray-600 font-medium">
                            <button onClick={() => setCurrentPage('home')} className={`flex items-center gap-1 ${currentPage === 'home' ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                                <LayoutGrid size={18} /> 题库
                            </button>

                            {userAuthority >= 2 && (
                                <button onClick={() => setCurrentPage('admin')} className={`flex items-center gap-1 ${currentPage === 'admin' ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                                    <ShieldCheck size={18} /> 管理后台
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {hasToken && (
                            <button onClick={() => setShowPublish(true)} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition">
                                <Plus size={16} /> 发布
                            </button>
                        )}
                        <div className="relative hidden sm:block">
                            <input type="text" placeholder="搜索..." className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64" />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 py-6">
                {currentPage === 'home' ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <aside className="hidden md:block md:col-span-3">
                            <UserCard
                                onShowLogin={() => setShowLogin(true)}
                                refreshTrigger={refreshTrigger}
                                onEditProfile={(u) => { setEditingUser(u); setShowEditProfile(true); }}
                                onUserLoaded={(auth) => setUserAuthority(auth)}
                            />
                        </aside>
                        <section className="col-span-1 md:col-span-6">
                            {/* 传递点击回调 */}
                            <ProblemFeed onItemClick={handleProblemClick} />
                        </section>
                        <aside className="hidden md:block md:col-span-3 space-y-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">📢 社区公告</h3>
                                <p className="text-sm text-gray-500">Vertex V1.0 正式公测！</p>
                            </div>
                        </aside>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <aside className="hidden md:block md:col-span-3">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                                <div className="text-xs font-bold text-gray-400 uppercase mb-4 px-2">Admin Menu</div>
                                <ul className="space-y-1">
                                    <li><button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm">题目审核</button></li>
                                </ul>
                            </div>
                        </aside>
                        <section className="col-span-1 md:col-span-9">
                            <AdminAudit />
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
