import { useRef, useState } from "react"

const SIGNAL_URL = "ws://192.168.0.2:3000"

export default function LiveStreamRoom() {
  const [role, setRole] = useState<"host" | "audience">("host")
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  // 发送弹幕
  const sendMessage = (msg: string) => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "chat", content: msg }))
    }
  }

  // 初始化 WebRTC + WebSocket
  const start = async () => {
    const ws = new WebSocket(SIGNAL_URL)
    wsRef.current = ws
    setConnected(false)

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ],
    })
    pcRef.current = pc

    // 观众端：收到远端流
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0]
      }
    }

    // ICE candidate
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        ws.send(JSON.stringify({ type: "candidate", candidate: e.candidate }))
      }
    }

    ws.onopen = async () => {
      setConnected(true)
      if (role === "host") {
        // 主播采集本地流
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))
        // 创建 offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        ws.send(JSON.stringify(offer))
      } else if (role === "audience") {
        // 观众主动请求 offer
        ws.send(JSON.stringify({ type: "need-offer" }))
      }
    }

    ws.onmessage = async (msg) => {
      let data
      if (msg.data instanceof Blob) {
        const text = await msg.data.text()
        data = JSON.parse(text)
      } else {
        data = JSON.parse(msg.data)
      }
      if (data.type === "offer" && role === "audience") {
        await pc.setRemoteDescription(data)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        ws.send(JSON.stringify(pc.localDescription))
      } else if (data.type === "answer" && role === "host") {
        await pc.setRemoteDescription(data)
      } else if (data.type === "candidate") {
        try {
          await pc.addIceCandidate(data.candidate)
        } catch (e) {}
      } else if (data.type === "chat") {
        setMessages((msgs) => [...msgs, data.content])
      } else if (data.type === "need-offer" && role === "host") {
        // 主播收到观众请求，重新 createOffer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        ws.send(JSON.stringify(offer))
      }
    }
  }

  // UI
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
      {/* 顶部栏 */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/80 shadow">
        {/* 主播信息 */}
        <div className="flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" className="w-10 h-10 rounded-full border" alt="主播头像" />
          <div>
            <div className="font-bold">主播昵称</div>
            <div className="text-xs text-gray-500">房间标题/简介</div>
          </div>
          <button className="ml-4 px-3 py-1 bg-pink-500 text-white rounded-full text-sm">关注</button>
        </div>
        {/* 房间信息 */}
        <div className="flex items-center gap-6 text-gray-600 text-sm">
          <span>房间号: 123456</span>
          <span>观众: 39</span>
          <span>点赞: 400</span>
        </div>
        {/* 角色切换与连接 */}
        <div className="flex items-center gap-2">
          <label className="mr-2">
            <input type="radio" checked={role === "host"} onChange={() => setRole("host")}/> 主播
          </label>
          <label>
            <input type="radio" checked={role === "audience"} onChange={() => setRole("audience")}/> 观众
          </label>
          <button className="ml-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={start} disabled={connected}>
            {connected ? "已连接" : "连接直播间"}
          </button>
        </div>
      </header>

      {/* 主体内容区 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 视频区 */}
        <div className="flex-1 flex items-center justify-center bg-black relative">
          {/* 占位：弹幕动画区 */}
          <div className="absolute top-0 left-0 w-full h-12 pointer-events-none z-10 flex items-center px-4">
            {/* 这里可后续实现弹幕动画 */}
            <span className="text-white/70 text-sm italic">弹幕动画区（占位）</span>
          </div>
          {/* 视频 */}
          <div className="w-[420px] h-[700px] bg-black rounded-xl shadow-lg flex items-center justify-center relative">
            {role === "host" ? (
              <video ref={localVideoRef} autoPlay muted className="w-full h-full object-contain rounded-xl bg-black" />
            ) : (
              <video ref={remoteVideoRef} autoPlay className="w-full h-full object-contain rounded-xl bg-black" />
            )}
          </div>
        </div>
        {/* 右侧弹幕/观众区 */}
        <aside className="w-80 bg-white/90 flex flex-col border-l h-full">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold">房间观众</span>
            <span className="text-xs text-gray-400">39人</span>
          </div>
          {/* 观众列表占位 */}
          <div className="flex flex-wrap gap-2 px-4 py-2 border-b">
            {[1,2,3,4,5].map(i => (
              <img key={i} src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`} className="w-8 h-8 rounded-full border" alt="观众" />
            ))}
            <span className="text-xs text-gray-400 ml-2">观众列表（占位）</span>
          </div>
          {/* 弹幕/评论区 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm text-blue-700 bg-blue-50 rounded px-2 py-1 w-fit max-w-full break-words shadow">
                {msg}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* 底部礼物/互动栏 */}
      <footer className="flex items-center justify-between px-6 py-3 bg-white/80 border-t">
        {/* 礼物栏占位 */}
        <div className="flex gap-2 items-center">
          <button className="bg-pink-100 px-3 py-1 rounded-full text-pink-600">送礼物</button>
          <button className="bg-yellow-100 px-3 py-1 rounded-full text-yellow-600">点赞</button>
          <span className="text-xs text-gray-400 ml-2">礼物栏（占位）</span>
        </div>
        {/* 弹幕输入框 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="发送弹幕"
            className="px-3 py-2 rounded-full border w-64"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                sendMessage(e.currentTarget.value)
                e.currentTarget.value = ""
              }
            }}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full" onClick={() => {
            const input = document.querySelector<HTMLInputElement>("#barrageInput");
            if (input && input.value) {
              sendMessage(input.value);
              input.value = "";
            }
          }}>发送</button>
        </div>
      </footer>
    </div>
  )
}
