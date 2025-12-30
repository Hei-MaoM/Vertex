// 通用响应结构
export interface CommonResp<T = any> {
    status: number;
    msg: string;
    data: T;
}

// 用户信息
export interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    authority: number; // 1=普通, 2=管理员, 3=超管
    status: number;
    created_at: string;
}

// 登录响应
export interface LoginData {
    token: string;
    expires_in: number;
    user: User;
}

// 标签
export interface Tag {
    id: number;
    name: string;
    category: string;
}

// 题目列表项 (Feed用)
export interface ProblemPost {
    id: number;
    title: string;
    source: string;
    // score: number; // 已删除
    tags: Tag[];
    is_solved: boolean;
}

// 题目详情 (Modal用)
export interface ProblemDetail {
    id: number;
    problem_id: number;
    title: string;
    source: string;
    content: string;
    solution: string;
    is_solved: boolean;
    problem_url: string;
    // tags: Tag[]; // 如果后端详情接口没返回 tags，这里就先不写，或者复用列表的 tags
}

// 列表响应
export interface ListRespData<T> {
    total: number;
    list: T[];
}

// 审核请求
export interface AuditReq {
    post_id: number;
    status: number;
    fix_problem_title?: string;
}

// 七牛 Token
export interface UploadTokenResp {
    token: string;
    domain: string;
}

// 本地上传响应
export interface LocalUploadResp {
    url: string;
}
