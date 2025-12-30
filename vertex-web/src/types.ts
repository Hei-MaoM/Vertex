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
    authority: number;
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

// 题目列表项
export interface ProblemPost {
    id: number;
    title: string;
    source: string;
    score: number;
    tags: Tag[];
    is_solved: boolean;
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

// === 新增：七牛 Token 响应 ===
export interface UploadTokenResp {
    token: string;
    domain: string;
}

// === 新增：发布题目请求 ===
export interface PublishReq {
    problem_url: string;
    problem_title: string;
    problem_source: string;
    tag_ids: number[];
    title: string;
    content: string;
    solution: string;
}
