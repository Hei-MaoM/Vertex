import {useEffect, useState} from 'react';
import {BrowserRouter, Route, Routes, useLocation, useNavigate} from 'react-router-dom';
import {LayoutGrid, Loader2, Plus, Search, ShieldCheck, User as UserIcon} from 'lucide-react';

// === 组件引入 ===
import {LoginModal} from './components/LoginModal';
import {EditProfileModal} from './components/EditProfileModal';
// ❌ 已移除 PublishModal import
import {AuditDetailModal} from './components/AuditDetailModal';

// === 页面组件 ===
import {Home} from './pages/Home';
import {Admin} from './pages/Admin';
import {OtherUser} from './pages/OtherUser';
import {ProblemDetailPage} from './pages/ProblemDetailPage';
import {PublishPage} from './pages/PublishPage'; // ✨ 新增：独立发布页
import {ProfilePage} from './components/ProfilePage'; // 我的主页 (复用组件)
// === API & Types ===
import {userApi} from './lib/api';
import type {CommonResp, User} from './types';
import {SearchResultPage} from './pages/SearchResultPage';
const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // === 全局状态 ===
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [initializing, setInitializing] = useState(true);

    // === 模态框状态 (PublishModal 已移除) ===
    const [showLogin, setShowLogin] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [auditId, setAuditId] = useState<number | null>(null);

    const hasToken = !!localStorage.getItem('jwt_token');
    const [searchKeyword, setSearchKeyword] = useState("");

    const handleRefresh = () => setRefreshTrigger(p => p + 1);

    // === 核心：应用启动时恢复登录状态 ===
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                setInitializing(false);
                return;
            }
            try {
                const res = await userApi.post<CommonResp<User>>('/v1/user/myinfo');
                if (res.data.status === 0 || res.data.status === 200) {
                    setCurrentUser(res.data.data);
                } else {
                    localStorage.removeItem('jwt_token');
                    setCurrentUser(null);
                }
            } catch (err) {
                console.error("自动登录失败", err);
                localStorage.removeItem('jwt_token');
                setCurrentUser(null);
            } finally {
                setInitializing(false);
            }
        };
        initAuth();
    }, [refreshTrigger]);

    // === 交互逻辑 ===
    const handleProblemClick = (id: number) => {
        navigate(`/problem/${id}`);
    };

    const handleViewUser = (userId: number) => {
        if (currentUser && userId === currentUser.id) {
            navigate('/profile');
        } else {
            navigate(`/user/${userId}`);
        }
    };
    const handleSearch = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!searchKeyword.trim()) return;
            navigate(`/search?q=${encodeURIComponent(searchKeyword)}`);
        }
    }
    const handleReviewClick = (id: number) => {
        setAuditId(id);
    };

    // === Loading 界面 ===
    if (initializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin"/>
                    <p className="text-gray-400 text-sm font-medium">Vertex 启动中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ================= 全局模态框区域 ================= */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLoginSuccess={handleRefresh}
            />

            {editingUser && (
                <EditProfileModal
                    isOpen={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    onSuccess={handleRefresh}
                    currentUser={editingUser}
                />
            )}

            {/* 审核详情依然保留为弹窗 */}
            <AuditDetailModal
                problemId={auditId}
                onClose={() => setAuditId(null)}
                onSuccess={handleRefresh}
            />

            {/* ================= 顶部导航栏 ================= */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-2xl font-black text-blue-600 cursor-pointer"
                              onClick={() => navigate('/')}>Vertex</span>

                        <div className="hidden md:flex gap-6 text-gray-600 font-medium">
                            <button onClick={() => navigate('/')}
                                    className={`flex items-center gap-1 ${location.pathname === '/' ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                                <LayoutGrid size={18} /> 题库
                            </button>

                            {hasToken && (
                                <button onClick={() => navigate('/profile')}
                                        className={`flex items-center gap-1 ${location.pathname === '/profile' ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                                    <UserIcon size={18}/> 我的
                                </button>
                            )}

                            {/* 只有管理员可见 */}
                            {currentUser && currentUser.authority >= 2 && (
                                <button onClick={() => navigate('/admin')}
                                        className={`flex items-center gap-1 ${location.pathname === '/admin' ? 'text-blue-600' : 'hover:text-blue-600'}`}>
                                    <ShieldCheck size={18} /> 管理后台
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {hasToken && (
                            // ✨✨✨ 修改：点击发布跳转页面 ✨✨✨
                            <button
                                onClick={() => navigate('/publish')}
                                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition"
                            >
                                <Plus size={16} /> 发布
                            </button>
                        )}
                        <div className="relative hidden sm:block">
                            <input
                                type="text"
                                placeholder="搜索..."
                                className="pl-9 pr-4 py-1.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                // ✨✨✨ 必须加上这一行，否则回车无效 ✨✨✨
                                onKeyDown={handleSearch}
                            />
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
                        </div>

                        {!hasToken && (
                            <button onClick={() => setShowLogin(true)}
                                    className="text-sm font-bold text-gray-600 hover:text-blue-600">
                                登录
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* ================= 路由内容区域 ================= */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <Routes>
                    {/* 1. 首页 */}
                    <Route path="/" element={
                        <Home
                            refreshTrigger={refreshTrigger}
                            setShowLogin={setShowLogin}
                            setEditingUser={setEditingUser}
                            setShowEditProfile={setShowEditProfile}
                            setCurrentUser={setCurrentUser}
                            onItemClick={handleProblemClick}
                            onUserClick={handleViewUser}
                        />
                    }/>

                    {/* 2. 题目详情页 */}
                    <Route path="/problem/:id" element={
                        <ProblemDetailPage/>
                    }/>

                    {/* 3. 发布页 (✨ 新增路由) */}
                    <Route path="/publish" element={
                        currentUser ? <PublishPage/> :
                            <div className="p-20 text-center text-gray-400">请先登录后发布</div>
                    }/>
                    <Route path="/search" element={<SearchResultPage />} />
                    {/* 4. 我的主页 */}
                    <Route path="/profile" element={
                        <div className="max-w-4xl mx-auto">
                            {currentUser ? (
                                <ProfilePage
                                    user={currentUser}
                                    onBack={() => navigate('/')}
                                    onItemClick={handleProblemClick}
                                />
                            ) : (
                                <div className="text-center py-20 text-gray-400 flex flex-col gap-4">
                                    <p>请先登录查看个人主页</p>
                                    <button onClick={() => setShowLogin(true)}
                                            className="text-blue-600 font-bold hover:underline">点击登录
                                    </button>
                                </div>
                            )}
                        </div>
                    }/>

                    {/* 5. 他人主页 */}
                    <Route path="/user/:id" element={
                        <OtherUser onItemClick={handleProblemClick}/>
                    }/>

                    {/* 6. 管理后台 */}
                    <Route path="/admin" element={
                        currentUser && currentUser.authority >= 2 ? (
                            <Admin currentUser={currentUser} onReview={handleReviewClick}/>
                        ) : (
                            <div className="text-center py-20 text-red-400 font-bold">403 - 权限不足</div>
                        )
                    }/>
                </Routes>
            </main>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <Layout/>
        </BrowserRouter>
    );
}

export default App;
