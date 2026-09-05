import { protocol, net } from "electron";
import path from "node:path";
import url from "node:url";
import fs from "node:fs";
import { createReadStream } from "node:fs";
import { getLocalMusicPaths } from "./configHelper.js";

// 允许通过 WebSocket 读取的本地音频扩展名
const AUDIO_EXTENSIONS = new Set([
	".mp3",
	".flac",
	".wav",
	".ogg",
	".aac",
	".wma",
	".m4a",
	".opus",
]);

// 网易云桌面端 User-Agent (远程音频流式请求使用)
const NETEASE_DESKTOP_UA =
	"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 Chrome/91.0.4472.164 NeteaseMusicDesktop/3.1.28.205001";

/**
 * 校验本地文件路径是否位于已配置的本地音乐目录内, 防止任意文件读取
 * @param {string} filePath 待校验的文件路径
 * @param {string[]} roots 已配置的本地音乐根目录列表
 */
function isWithinRoots(filePath, roots) {
	const resolved = path.resolve(filePath);
	return roots.some((root) => {
		const resolvedRoot = path.resolve(root);
		const relative = path.relative(resolvedRoot, resolved);
		return (
			relative === "" ||
			(!relative.startsWith("..") && !path.isAbsolute(relative))
		);
	});
}

/**
 * 校验远程地址是否安全, 阻止 SSRF (本地回环 / 内网地址 / 非 http(s) 协议)
 * 公网 http(s) 地址 (各音乐平台 CDN) 仍然放行
 * @param {string} rawUrl 远程音频地址
 */
function isSafeRemoteUrl(rawUrl) {
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		return false;
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

	const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
	if (host === "localhost" || host.endsWith(".localhost")) return false;
	if (
		host === "::1" ||
		host === "::" ||
		host.startsWith("fe80") ||
		host.startsWith("fc") ||
		host.startsWith("fd")
	)
		return false;

	const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (ipv4) {
		const first = Number(ipv4[1]);
		const second = Number(ipv4[2]);
		if (first === 0 || first === 127 || first === 10) return false;
		if (first === 169 && second === 254) return false;
		if (first === 192 && second === 168) return false;
		if (first === 172 && second >= 16 && second <= 31) return false;
	}

	return true;
}

/**
 * 根据文件扩展名获取 MIME 类型
 * @param {string} filePath 
 */
function getMimeType(filePath) {
	const ext = path.extname(filePath).toLowerCase();
	const map = {
		".mp3": "audio/mpeg",
		".flac": "audio/flac",
		".wav": "audio/wav",
		".ogg": "audio/ogg",
		".aac": "audio/aac",
		".wma": "audio/x-ms-wma",
		".m4a": "audio/mp4",
		".opus": "audio/opus",
	};
	return map[ext] || "application/octet-stream";
}

/**
 * 处理本地文件请求
 * @param {Request} req 
 */
async function handleFileRequest(req) {
	const filePath = decodeURIComponent(new URL(req.url).pathname.slice(1));
	let roots = await getLocalMusicPaths();
	if (!AUDIO_EXTENSIONS.has(path.extname(filePath))||!isWithinRoots(filePath, roots)) {
		return new Response("Bad request", {
			status: 400,
			headers: { "content-type": "text/html" },
		});
	}

	try {
		const stat = fs.statSync(filePath);
		const totalSize = stat.size;
		const rangeHeader = req.headers.get("Range");
		let start = 0;
		let end = totalSize - 1;
		let status = 200;

		if (rangeHeader) {
			const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
			if (match) {
				start = parseInt(match[1], 10);
				if (match[2] && match[2] !== "") {
					end = parseInt(match[2], 10);
				} else {
					end = totalSize - 1;
				}
				if (start >= totalSize || start > end) {
					return new Response("Range not satisfiable", {
						status: 416,
						headers: { "Content-Range": `bytes */${totalSize}` },
					});
				}
				status = 206;
			}
		}

		// 创建只读指定范围的流
		const stream = createReadStream(filePath, { start, end });

		const headers = {
			"Content-Type": getMimeType(filePath),
			"Content-Length": (end - start + 1).toString(),
			"Accept-Ranges": "bytes",
			"Cache-Control": "no-cache",
		};
		if (status === 206) {
			headers["Content-Range"] = `bytes ${start}-${end}/${totalSize}`;
		}

		return new Response(stream, { status, headers });
	} catch (err) {
		console.error("[Protocol] File read error:", err);
		return new Response("File not found", { status: 404 });
	}
}

/**
 * 处理远程代理请求
 * @param {Request} req 
 */
async function handleRemoteRequest(req) {
	let targetUrl = decodeURIComponent(req.url.slice("arcanum://remote/".length));
	
	if (!isSafeRemoteUrl(targetUrl)) {
		console.error(`[Protocol] Rejected unsafe remote URL: ${targetUrl}`);
		return new Response("Unsafe remote URL", {
			status: 400,
			headers: { "content-type": "text/html" },
		});
	}

	const headers = {
		"User-Agent": NETEASE_DESKTOP_UA,
	};
	const rangeHeader = req.headers.get("Range");
	
	if (rangeHeader) {
		headers["Range"] = rangeHeader;
	}

	const response = await fetch(targetUrl,{headers});
	return response;
}

/**
 * 注册协议
 */
export function registerProtocol() {
	protocol.registerSchemesAsPrivileged([
		{
			scheme: "arcanum",
			privileges: {
				standard: true,
				bypassCSP: true,
				stream: true,
			},
		},
	]);
}

/**
 * 初始化协议并处理请求
 */
export function setupProtocol() {
	protocol.handle("arcanum", async (req) => {
		const reqUrl = new URL(req.url);
		switch (reqUrl.hostname) {
			case "file": {
				return await handleFileRequest(req);
			}
			case "remote": {
				return await handleRemoteRequest(req);
			}
			default: {
				return new Response("Bad request", {
					status: 400,
					headers: { "content-type": "text/html" },
				});
			}
		}
	});
}
