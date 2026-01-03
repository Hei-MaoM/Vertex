import {UserCard} from '../components/UserCard';
import {ProblemFeed} from '../components/ProblemFeed';
import {LeaderboardCard} from '../components/LeaderboardCard';
import type {User} from '../types';

interface Props {
    refreshTrigger: number;
    setShowLogin: (show: boolean) => void;
    setEditingUser: (u: User) => void;
    setShowEditProfile: (show: boolean) => void;
    setCurrentUser: (u: User | null) => void;
    onItemClick: (id: number) => void;
    onUserClick: (id: number) => void;
}

export const Home = ({
                         refreshTrigger, setShowLogin, setEditingUser,
                         setShowEditProfile, setCurrentUser, onItemClick, onUserClick
                     }: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="hidden md:block md:col-span-3">
                <UserCard
                    onShowLogin={() => setShowLogin(true)}
                    refreshTrigger={refreshTrigger}
                    onEditProfile={(u) => {
                        setEditingUser(u);
                        setShowEditProfile(true);
                    }}
                    onUserLoaded={setCurrentUser}
                    onGoProfile={() => { /* 这里不再需要回调，UserCard内部用 Link 即可，或者保留回调 */
                    }}
                />
            </aside>

            <section className="col-span-1 md:col-span-6">
                <ProblemFeed onItemClick={onItemClick} onUserClick={onUserClick}/>
            </section>

            <aside className="hidden md:block md:col-span-3 space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-2">📢 社区公告</h3>
                    <p className="text-sm text-gray-500">Vertex V1.0 正式公测！</p>
                </div>
                <LeaderboardCard onUserClick={onUserClick}/>
            </aside>
        </div>
    );
};
