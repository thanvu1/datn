import { useState, useEffect, useRef } from 'react';
import { createTypstCompiler, createTypstRenderer } from '@myriaddreamin/typst.ts';

export interface ProjectFile {
    path: string;
    type: 'binary' | 'text';
}

export const useTypstProject = (
    assets: ProjectFile[],
    mainCode: string
) => {
    const [svg, setSvg] = useState('');
    const [status, setStatus] = useState('Đang khởi tạo...');
    const [errors, setErrors] = useState<any[]>([]);

    const compilerRef = useRef<any>(null);
    const rendererRef = useRef<any>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setStatus('Đang tải WASM...');
                const compiler = createTypstCompiler();
                await compiler.init({ getModule: () => fetch('/typst_ts_web_compiler_bg.wasm') });
                const renderer = createTypstRenderer();
                await renderer.init({ getModule: () => fetch('/typst_ts_renderer_bg.wasm') });

                setStatus('Đang nạp tài nguyên...');

                await Promise.all(assets.map(async (file) => {
                    const res = await fetch(file.path);
                    if (!res.ok) throw new Error(`404 Not Found: ${file.path}`);

                    const contentType = res.headers.get('content-type');
                    if (contentType && contentType.includes('text/html')) {
                        throw new Error(`Sai đường dẫn: '${file.path}' trả về HTML. Hãy kiểm tra thư mục public.`);
                    }

                    let data: Uint8Array;
                    if (file.type === 'binary') {
                        data = new Uint8Array(await res.arrayBuffer());
                    } else {
                        data = new TextEncoder().encode(await res.text());
                    }

                    // --- SỬA LẠI: LUÔN DÙNG ĐƯỜNG DẪN TUYỆT ĐỐI (Có dấu /) ---
                    let virtualPath = file.path;
                    if (!virtualPath.startsWith('/')) {
                        virtualPath = '/' + virtualPath;
                    }
                    console.log(`Mapping: ${virtualPath}`);
                    compiler.mapShadow(virtualPath, data);
                }));

                compilerRef.current = compiler;
                rendererRef.current = renderer;

                setStatus('Sẵn sàng');
                compileInternal(mainCode, compiler, renderer);

            } catch (e: any) {
                console.error("Init Error:", e);
                setErrors([{ message: `Lỗi khởi tạo: ${e.message}` }]);
                setStatus('Lỗi hệ thống');
            }
        };
        init();
    }, []);

    const compileInternal = async (code: string, compiler: any, renderer: any) => {
        if (!compiler || !renderer) return;
        try {
            setErrors([]);

            // Map file main.typ (TUYỆT ĐỐI)
            compiler.mapShadow('/main.typ', new TextEncoder().encode(code));

            // Compile (TUYỆT ĐỐI)
            const artifact = await compiler.compile({ mainFilePath: '/main.typ' });

            const svgOutput = await renderer.renderToSvg({ artifactContent: artifact });
            setSvg(svgOutput);
        } catch (e: any) {
            console.error(e);
            if (e.diagnostics) {
                setErrors(e.diagnostics);
            } else if (Array.isArray(e)) {
                setErrors(e);
            } else {
                setErrors([{ message: `Lỗi biên dịch: ${e.message || e}`, severity: "error" }]);
            }
        }
    };

    const compile = (code: string) => {
        compileInternal(code, compilerRef.current, rendererRef.current);
    };

    return { svg, status, errors, compile };
};