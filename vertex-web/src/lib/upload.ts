import axios from 'axios';
import { userApi } from './api';
import type {CommonResp, UploadTokenResp} from '../types';

/**
 * 上传文件到七牛云
 * @param file 选择的文件对象
 * @returns 完整的图片URL
 */
export const uploadToQiniu = async (file: File): Promise<string> => {
    // 1. 获取上传凭证
    const res = await userApi.get<CommonResp<UploadTokenResp>>('/v1/user/updatetoken'); // 注意：后端接口路径需确认，或者是 /common/v1/upload/token
    // 如果你的接口是 /v1/user/updatetoken (根据之前的 user.api)

    if (res.data.status !== 0 && res.data.status !== 200) {
        throw new Error(res.data.msg || "获取上传凭证失败");
    }

    const { token, domain } = res.data.data;

    // 2. 构建表单数据
    const formData = new FormData();
    formData.append('token', token);
    formData.append('file', file);
    // 生成随机文件名，防止覆盖
    const randomName = `avatar_${new Date().getTime()}_${Math.random().toString(36).substring(7)}`;
    formData.append('key', randomName);

    // 3. 发送给七牛云 (华东区: upload.qiniup.com, 北美: upload-na0.qiniup.com)
    // 如果不确定区域，可以用 upload.qiniup.com 让它自动调度，或者看你后端配置
    const qiniuRes = await axios.post('https://up-na0.qiniup.com', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    // 4. 拼接 URL
    // 七牛返回的 key 就是文件名
    const key = qiniuRes.data.key;
    // 确保 domain 后面有 /
    const finalDomain = domain.endsWith('/') ? domain : domain + '/';

    return finalDomain + key;
};
