import { useEffect, useState } from "react"
import Editor, { loader } from "@monaco-editor/react"
import { useDebounce } from "use-debounce"
import axios from "axios"
import { Group, Panel, Separator } from "react-resizable-panels"

loader.config({
  paths: {
    vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs",
  },
})

const DEMO_CODE = `#let conf(title: none, doc) = {
  set text(font: "Times New Roman", size: 13pt, lang: "vi")
  set par(justify: true, leading: 1.5em)
  set page(margin: (left: 3cm, right: 2cm, top: 2cm, bottom: 2cm))
  
  // Tiêu đề
  align(center, text(18pt, weight: "bold", title))
  v(1em)
  
  // Nội dung chính
  doc
}


#show: doc => conf(
  title: "Báo Cáo Thực Tập (Times + Math)",
  doc
)

= 1. Giới Thiệu
Font chữ đã được chuyển sang *Times New Roman*.
Lỗi "Access Denied" đã được sửa hoàn toàn bằng cách nhúng template!

= 2. Toán Học (Tự động dùng math.otf)
Typst tự động nhận diện font toán học khi bạn nạp file math.otf.
$ S = sum_(i=1)^n x_i^2 + integral_0^infinity e^(-x) "dx" $

Ma trận:
$ A = mat(1, 2; 3, 4) $

= 3. Tài Liệu Tham Khảo
`

function buildSvgDocument(svg: string) {
  // Nhét SVG vào một HTML document tối giản để iframe render ổn định
  // (có base để đảm bảo URL tương đối không bị hiểu sai)
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <base href="/" />
  <style>
    html, body { margin: 0; padding: 0; background: white; }
    /* Canh giữa trang, giữ scroll */
    .wrap { display: flex; justify-content: center; padding: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    ${svg}
  </div>
</body>
</html>`
}

export default function App() {
  const [sourceCode, setSourceCode] = useState(DEMO_CODE)
  const [rawSvg, setRawSvg] = useState<string>("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [debouncedCode] = useDebounce(sourceCode, 800)

  useEffect(() => {
    if (!debouncedCode) return

    setStatus("loading")
    setErrorMsg("")

    axios
      .post("http://localhost:3000/api/compile", { code: debouncedCode })
      .then((res) => {
        if (res.data?.status === "success" && typeof res.data.svg === "string") {
          setRawSvg(res.data.svg)
          setStatus("success")
        } else {
          setRawSvg("")
          setStatus("error")
          const diag = res.data?.diagnostics?.[0]?.message
          setErrorMsg(diag || "Compile error")
        }
      })
      .catch((e) => {
        setRawSvg("")
        setStatus("error")
        setErrorMsg(e?.message || "Network error")
      })
  }, [debouncedCode])

  const iframeDoc = rawSvg ? buildSvgDocument(rawSvg) : ""

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-900 text-white overflow-hidden">
      <header className="h-12 shrink-0 border-b border-neutral-700 bg-neutral-800 flex items-center justify-between px-4 shadow-sm z-10">
        <span className="font-bold text-blue-400">Typst Editor</span>
        <div className="text-xs">
          Trạng thái:{" "}
          <span className={status === "success" ? "text-green-400" : "text-yellow-400"}>
            {status}
          </span>
        </div>
      </header>

      <div style={{ height: "calc(100vh - 48px)" }}>
        <Group orientation="horizontal" className="h-full w-full">
          <Panel defaultSize={50} minSize={20} className="bg-[#1e1e1e]">
            <Editor
              height="100%"
              defaultLanguage="markdown"
              theme="vs-dark"
              value={sourceCode}
              onChange={(val) => setSourceCode(val || "")}
              options={{
                minimap: { enabled: false },
                automaticLayout: true,
                padding: { top: 20 },
              }}
            />
          </Panel>

          <Separator
            className="
              relative w-2 -mx-1
              cursor-col-resize
              bg-transparent
              hover:bg-neutral-700/40
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
          />

          <Panel defaultSize={50} minSize={20} className="bg-white">
            <div className="h-full w-full overflow-auto p-4 flex justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
              {status === "error" ? (
                <div className="text-red-600 mt-10 max-w-[70ch]">
                  Lỗi: {errorMsg || "Không xác định"}
                </div>
              ) : rawSvg ? (
                <iframe
                  title="Typst preview"
                  // ✅ sandbox rỗng = chặn scripts, forms, top-nav, popups, storage...
                  sandbox=""
                  // ✅ srcDoc là HTML nội tuyến, không cần dangerouslySetInnerHTML
                  srcDoc={iframeDoc}
                  className="shadow-2xl bg-white min-h-[297mm] min-w-[210mm] border border-neutral-200"
                />
              ) : (
                <div className="text-gray-400 mt-10">
                  {status === "loading" ? "Đang biên dịch..." : "Đang chờ biên dịch..."}
                </div>
              )}
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  )
}
