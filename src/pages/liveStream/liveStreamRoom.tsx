import { use, useRef, useState } from "react"

const SIGNAL_URL = "ws://192.168.0.2:3000"

export default function LiveStreamRoom() {
  const [role, setRole] = useState<"host" | "audience">("host")
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [logStr, setLogStr] = useState<string[]>([])

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
        // {
        //   urls: "stun:global.stun.twilio.com:3478?transport=udp",
        // },
      ],
    })
    pcRef.current = pc

    // 观众端：收到远端流
    pc.ontrack = (e) => {
      console.log("ontrack", e)
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
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">WebRTC 直播间 Demo</h1>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            checked={role === "host"}
            onChange={() => setRole("host")}
          />{" "}
          主播
        </label>
        <label>
          <input
            type="radio"
            checked={role === "audience"}
            onChange={() => setRole("audience")}
          />{" "}
          观众
        </label>
        <button
          className="ml-6 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={start}
          disabled={connected}
        >
          {connected ? "已连接" : "连接直播间"}
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <div>
          <h2 className="font-semibold mb-2">本地视频</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-64 h-40 bg-black rounded"
          />
        </div>
        <div>
          <h2 className="font-semibold mb-2">远端视频</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-64 h-40 bg-black rounded"
          />
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="发送弹幕"
          className="px-3 py-2 border rounded mr-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value) {
              sendMessage(e.currentTarget.value)
              e.currentTarget.value = ""
            }
          }}
        />
      </div>
      <div className="bg-gray-100 rounded p-2 h-32 overflow-y-auto">
        <div className="text-xs text-gray-700 mb-1">弹幕/消息：</div>
        {messages.map((msg, i) => (
          <div key={i} className="text-sm text-blue-700">
            {msg}
          </div>
        ))}
      </div>
    </div>
  )
}
