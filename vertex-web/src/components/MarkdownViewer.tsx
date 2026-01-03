import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';

// ✨ 数学公式插件
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// ✨✨✨✨✨ 关键：必须引入这个 CSS 文件！ ✨✨✨✨✨
import 'katex/dist/katex.min.css';

interface Props {
    content: string;
    className?: string;
}

export const MarkdownViewer = ({content, className = ""}: Props) => {
    return (
        <div className={`prose prose-sm md:prose-base max-w-none dark:prose-invert ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]} // 解析 $公式$
                rehypePlugins={[rehypeHighlight, rehypeKatex]} // 渲染公式 & 代码高亮
                components={{
                    a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
