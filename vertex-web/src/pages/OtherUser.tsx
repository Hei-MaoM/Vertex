import {useNavigate, useParams} from 'react-router-dom';
import {UserProfilePage} from '../components/UserProfilePage';

interface Props {
    onItemClick: (id: number) => void;
}

export const OtherUser = ({onItemClick}: Props) => {
    const {id} = useParams<{ id: string }>(); // 从 URL 获取 /user/:id
    const navigate = useNavigate();

    if (!id) return null;

    return (
        <div className="max-w-4xl mx-auto">
            <UserProfilePage
                userId={Number(id)}
                onBack={() => navigate('/')} // 返回首页
                onItemClick={onItemClick}
            />
        </div>
    );
};
