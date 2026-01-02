import {useState} from 'react';
import {UserCard} from './components/UserCard';
import {ProblemFeed} from './components/ProblemFeed';
import {AdminAudit} from './components/AdminAudit';
import {LoginModal} from './components/LoginModal';
import {EditProfileModal} from './components/EditProfileModal';
import {PublishModal} from './components/PublishModal';
import {ProblemDetailModal} from './components/ProblemDetailModal';
import {AuditDetailModal} from './components/AuditDetailModal';
import {ProfilePage} from './components/ProfilePage'; // ✨ 引入个人主页组件
import {LayoutGrid, Plus, Search, ShieldCheck, User as UserIcon} from 'lucide-react';
import type {User} from './types';
import {LeaderboardCard} from './components/LeaderboardCard';
function App() {
    // 路由状态：home | admin | profile
    const [currentPage, setCurrentPage] = useState<'home' | 'admin' | 'profile'>('home');

    // 模态框状态
    const [showLogin, setShowLogin] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null); // 编辑用的临时对象
    const [showPublish, setShowPublish] = useState(false);
    const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null); // 普通详情
    const [auditId, setAuditId] = useState<number | null>(null); // 审核详情

    // 全局用户状态
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [currentUser, setCurrentUser] = useState<User | null>(null); // ✨ 当前登录用户完整信息

    const hasToken = !!localStorage.getItem('jwt_token');
    const handleRefresh = () => setRefreshTrigger(p => p + 1);

    // 点击普通列表 -> 打开普通详情
    const handleProblemClick = (id: number) => {
        if (!hasToken) {
            setShowLogin(true);
        } else {
            setSelectedProblemId(id);
        }
    };

    // 点击审核列表 -> 打开审核详情
    const handleReviewClick = (id: number) => {
        setAuditId(id);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 🟢 全局模态框区域 */}
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

            <ProblemDetailModal
                problemId={selectedProblemId}
                onClose={() => setSelectedProblemId(null)}
            />

            <AuditDetailModal
                problemId={auditId}
                onClose={() => setAuditId(null)}
                onSuccess={handleRefresh}
            />

            {/* 🔵 顶部导航栏 */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-black text-blue-600 cursor-pointer" onClick={() => setCurrentPage('home')}>Vertex</span>
                        <div className="hidden md:flex gap-6 text-gray-600 font-medium">
                            <button
                                onClick={() => setCurrentPage('home')}
                                className={`flex items-center gap-1 ${currentPage === 'home' ? 'text-blue-600' : 'hover:text-blue-600'}`}
                            >
                                <LayoutGrid size={18} /> 题库
                            </button>

                            {/* 个人中心按钮 (可选) */}
                            {hasToken && (
                                <button
                                    onClick={() => setCurrentPage('profile')}
                                    className={`flex items-center gap-1 ${currentPage === 'profile' ? 'text-blue-600' : 'hover:text-blue-600'}`}
                                >
                                    <UserIcon size={18}/> 我的
                                </button>
                            )}

                            {/* 管理后台按钮 */}
                            {currentUser && currentUser.authority >= 2 && (
                                <button
                                    onClick={() => setCurrentPage('admin')}
                                    className={`flex items-center gap-1 ${currentPage === 'admin' ? 'text-blue-600' : 'hover:text-blue-600'}`}
                                >
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

            {/* 🟠 主体内容区域 */}
            <main className="max-w-6xl mx-auto px-4 py-6">

                {/* ============ 场景 1: 首页 ============ */}
                {currentPage === 'home' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <aside className="hidden md:block md:col-span-3">
                            <UserCard
                                onShowLogin={() => setShowLogin(true)}
                                refreshTrigger={refreshTrigger}
                                onEditProfile={(u) => { setEditingUser(u); setShowEditProfile(true); }}
                                // ✨ 接收完整用户对象，更新 App 状态
                                onUserLoaded={(user) => setCurrentUser(user)}
                                // ✨ 切换到个人主页
                                onGoProfile={() => setCurrentPage('profile')}
                            />
                        </aside>
                        <section className="col-span-1 md:col-span-6">
                            <ProblemFeed onItemClick={handleProblemClick} />
                        </section>
                        <aside className="hidden md:block md:col-span-3 space-y-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-2">📢 社区公告</h3>
                                <p className="text-sm text-gray-500">Vertex V1.0 正式公测！欢迎发布原创算法题解。</p>
                            </div>
                            <LeaderboardCard />
                        </aside>
                    </div>
                )}

                {/* ============ 场景 2: 个人主页 ============ */}
                {currentPage === 'profile' && (
                    <div className="max-w-4xl mx-auto">
                        {currentUser ? (
                            <ProfilePage
                                user={currentUser}
                                onBack={() => setCurrentPage('home')}
                                // ✨ 传入点击回调，复用 handleProblemClick
                                onItemClick={handleProblemClick}
                            />
                        ) : (
                            <div className="text-center py-20 text-gray-400">正在加载用户信息...</div>
                        )}
                    </div>
                )}

                {/* ============ 场景 3: 管理后台 ============ */}
                {currentPage === 'admin' && (
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
                            <AdminAudit onReview={handleReviewClick}/>
                        </section>
                    </div>
                )}

            </main>
        </div>
    );
}

export default App;
