import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FONTS_DIR = path.join(__dirname, "../assets/fonts")

const compiler = NodeCompiler.create()

export async function compileCode(sourceCode) {
    try {
        const args = {
            mainFileContent: sourceCode,
            inputs: {},
            fontPaths: [FONTS_DIR],
        }

        const svgOutput = await compiler.svg(args)

        // ✅ normalize: string / array / buffer
        let svgText = svgOutput
        if (Array.isArray(svgText)) svgText = svgText.join("\n")
        if (svgText && typeof svgText !== "string") {
            svgText = Buffer.from(svgText).toString("utf8")
        }

        if (!svgText || svgText.trim().length === 0) {
            return {
                status: "error",
                svg: null,
                diagnostics: [{ message: "Empty SVG output" }],
            }
        }

        return {
            status: "success",
            svg: svgText,
            diagnostics: [],
        }
    } catch (error) {
        console.error("Compile Error Details:", error)

        const rawDiagnostics = error?.diagnostics || []
        let markers = []

        if (Array.isArray(rawDiagnostics)) {
            markers = rawDiagnostics.map((diag) => ({
                message: diag.message || "Unknown error",
                severity: diag.severity === "error" ? "Error" : "Warning",
                startLineNumber: (diag.range?.start?.line ?? 0) + 1,
                startColumn: (diag.range?.start?.character ?? 0) + 1,
                endLineNumber: (diag.range?.end?.line ?? 0) + 1,
                endColumn: (diag.range?.end?.character ?? 0) + 1,
            }))
        } else {
            markers.push({
                message: error?.message || "Internal Server Error during compilation",
                severity: "Error",
                startLineNumber: 1,
                startColumn: 1,
                endLineNumber: 1,
                endColumn: 1,
            })
        }

        return {
            status: "error",
            svg: null,
            diagnostics: markers,
        }
    }
}
