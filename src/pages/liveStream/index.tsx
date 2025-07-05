import { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';
// @ts-ignore
import flvjs from 'flv.js';
// @ts-ignore
import dashjs from 'dashjs';

const streams = {
  hls: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  flv: 'http://ossrs.net:8080/live/livestream.flv',
  dash: 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
  webrtc: null, // WebRTC需要特殊处理
};

const statusMap = {
  live: { color: 'bg-green-500', text: '直播中' },
  buffering: { color: 'bg-yellow-400', text: '缓冲中...' },
  offline: { color: 'bg-red-500', text: '未连接' },
  error: { color: 'bg-red-700', text: '连接错误' },
};

type StreamType = '' | 'hls' | 'flv' | 'dash' | 'webrtc';

export default function LiveStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [streamType, setStreamType] = useState<StreamType>('');
  const [status, setStatus] = useState<'live' | 'buffering' | 'offline' | 'error'>('offline');
  const [statusText, setStatusText] = useState('未连接');
  const [isMuted, setIsMuted] = useState(true);
  const [latency, setLatency] = useState('-');
  const [bufferSize, setBufferSize] = useState('0');
  const [videoResolution, setVideoResolution] = useState('-');
  const [bitrate, setBitrate] = useState('-');

  // 释放播放器资源
  const destroyPlayer = () => {
    if (player) {
      try {
        if (player.destroy) player.destroy();
        if (player.unload) player.unload();
        if (player.detachMedia) player.detachMedia();
      } catch (e) {
        // ignore
      }
      setPlayer(null);
    }
    if (videoRef.current) {
      videoRef.current.src = '';
      // @ts-ignore
      videoRef.current.srcObject = null;
    }
  };

  // 切换流
  useEffect(() => {
    destroyPlayer();
    setStatus('offline');
    setStatusText('初始化中...');
    if (!streamType) return;
    const video = videoRef.current;
    if (!video) return;
    if (streamType === 'hls') {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(streams.hls);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
        hls.on(Hls.Events.ERROR, () => {
          setStatus('error');
          setStatusText('HLS源错误');
        });
        setPlayer(hls);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streams.hls;
        video.onloadedmetadata = () => video.play();
      }
    } else if (streamType === 'flv') {
      if (flvjs.isSupported()) {
        const flv = flvjs.createPlayer({ type: 'flv', url: streams.flv });
        flv.attachMediaElement(video);
        flv.load();
        flv.play();
        flv.on(flvjs.Events.ERROR, () => {
          setStatus('error');
          setStatusText('FLV源错误');
        });
        setPlayer(flv);
      }
    } else if (streamType === 'dash') {
      try {
        const dash = dashjs.MediaPlayer().create();
        dash.initialize(video, streams.dash, true);
        dash.setAutoPlay(true);
        dash.on('error', () => {
          setStatus('error');
          setStatusText('DASH源错误');
        });
        setPlayer(dash);
      } catch {
        setStatus('error');
        setStatusText('DASH源初始化失败');
      }
    } else if (streamType === 'webrtc') {
      setStatus('live');
      setStatusText('低延迟模式');
      // WebRTC占位，实际需信令服务器
      // 可参考原生实现
    }
    // eslint-disable-next-line
  }, [streamType]);

  // 事件监听
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => { setStatus('live'); setStatusText('直播中'); };
    const onWaiting = () => { setStatus('buffering'); setStatusText('缓冲中...'); };
    const onPause = () => { setStatus('offline'); setStatusText('已暂停'); };
    const onEnded = () => { setStatus('offline'); setStatusText('直播已结束'); };
    const onError = () => { setStatus('error'); setStatusText('连接错误'); };
    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, []);

  // 静音切换
  const toggleMute = () => {
    setIsMuted((m) => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  // 播放/暂停
  const play = () => videoRef.current?.play();
  const pause = () => videoRef.current?.pause();
  const fullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
    // @ts-ignore
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
    // @ts-ignore
    else if (video.msRequestFullscreen) video.msRequestFullscreen();
  };

  // 状态统计
  useEffect(() => {
    const timer = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      // 缓冲
      const buffered = video.buffered;
      const buffer = buffered.length > 0 ? buffered.end(buffered.length - 1) - video.currentTime : 0;
      setBufferSize(buffer.toFixed(1));
      setLatency((buffer * 1000).toFixed(0));
      setVideoResolution(video.videoWidth > 0 ? `${video.videoWidth}×${video.videoHeight}` : '-');
      // 码率可通过媒体流统计API获取，这里占位
      setBitrate('-');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">HTML5直播播放器</h1>
      </header>
      <div className="rounded-xl overflow-hidden shadow-lg bg-black/70 mb-6">
        <video
          ref={videoRef}
          className="w-full bg-black"
          controls
          playsInline
          autoPlay
          muted={isMuted}
        >
          您的浏览器不支持HTML5视频播放。
        </video>
      </div>
      <div className="flex flex-wrap gap-4 items-center bg-black/80 rounded-lg p-4 mb-6">
        <select
          className="px-4 py-2 rounded-full border-2 border-indigo-500 bg-indigo-900 text-white"
          value={streamType}
          onChange={e => setStreamType(e.target.value as StreamType)}
        >
          <option value="">-- 选择直播源 --</option>
          <option value="hls">HLS (.m3u8)</option>
          <option value="flv">FLV (.flv)</option>
          <option value="dash">DASH (.mpd)</option>
          <option value="webrtc">WebRTC (低延迟)</option>
        </select>
        <button className="btn px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 text-white font-bold flex items-center gap-2" onClick={play}>
          <span>▶</span> 播放
        </button>
        <button className="btn px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 text-white font-bold flex items-center gap-2" onClick={pause}>
          <span>⏸</span> 暂停
        </button>
        <button className="btn px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 text-white font-bold flex items-center gap-2" onClick={fullscreen}>
          <span>⛶</span> 全屏
        </button>
        <button className="btn px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-400 text-white font-bold flex items-center gap-2" onClick={toggleMute}>
          <span>{isMuted ? '🔈' : '🔊'}</span> {isMuted ? '开启声音' : '静音'}
        </button>
        <div className="flex items-center gap-2 ml-4">
          <span className={`w-3 h-3 rounded-full inline-block ${statusMap[status].color} shadow`}></span>
          <span>{statusText}</span>
        </div>
      </div>
      <div className="bg-black/60 rounded-xl p-6 mt-8">
        <h2 className="text-xl font-bold text-indigo-300 mb-4">播放器状态</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-indigo-200 font-semibold mb-2">当前延迟</h3>
            <p className="text-lg">{latency} ms</p>
          </div>
          <div className="bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-indigo-200 font-semibold mb-2">缓冲大小</h3>
            <p className="text-lg">{bufferSize} s</p>
          </div>
          <div className="bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-indigo-200 font-semibold mb-2">视频分辨率</h3>
            <p className="text-lg">{videoResolution}</p>
          </div>
          <div className="bg-indigo-900/30 p-4 rounded-lg border-l-4 border-indigo-500">
            <h3 className="text-indigo-200 font-semibold mb-2">码率</h3>
            <p className="text-lg">{bitrate} kbps</p>
          </div>
        </div>
      </div>
    </div>
  );
} 