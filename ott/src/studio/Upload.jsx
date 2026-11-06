import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UploadIcon } from '../components/Icons';
import { Badge, bytes, PageHead, Panel, useTick } from '../console/ui';
import { UPLOAD_STEPS, uploadState, useStudio } from '../context/StudioContext';
import { byArtist } from '../data/contents';

const TYPES = ['숏드라마 회차', '예능 · 자체콘텐츠', '공연 영상', '릴스'];
const VIS = ['공개', '멤버십 전용', '비공개'];
const STEP_DESC = ['원본 파일 저장 (S3)', 'HLS 변환 1080p · 720p · 480p', '운영자 확인 후 게시', '서비스에 노출'];

export default function Upload() {
  const st = useStudio();
  const { channel } = st;
  const now = useTick(500);
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const [lastId, setLastId] = useState(null);
  const series = byArtist(channel.id).filter((c) => c.type === 'drama');
  const [form, setForm] = useState({ title: '', type: TYPES[0], series: series[0]?.id || 'new', desc: '', visibility: '공개', age: 'ALL' });

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('video/')) return setError('영상 파일만 올릴 수 있어요.');
    setError('');
    setFile({ name: f.name, size: f.size });
    setPreview(URL.createObjectURL(f));
    if (!form.title) setForm((p) => ({ ...p, title: f.name.replace(/\.[^.]+$/, '') }));
  };

  const useSample = () => {
    setFile({ name: 'sample_episode_master.mp4', size: 356_000_000 });
    setPreview('');
    if (!form.title) setForm((p) => ({ ...p, title: '샘플 에피소드' }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!file) return setError('업로드할 영상을 선택해주세요.');
    if (!form.title.trim()) return setError('제목을 입력해주세요.');
    const id = `up-${Date.now()}`;
    st.addUpload({ ...form, title: form.title.trim(), fileName: file.name, size: file.size, channelId: channel.id });
    setLastId(id);
    setFile(null);
    setPreview('');
    setForm({ ...form, title: '', desc: '' });
  };

  // 방금 올린 영상의 처리 상태 (addUpload가 같은 시각 기반 id를 쓰므로 가장 최근 항목으로 찾음)
  const latest = lastId && st.uploads.find((u) => u.channelId === channel.id);
  const state = latest && uploadState(latest, st.reviews[latest.id], now);

  return (
    <>
      <PageHead title="영상 업로드" desc="업로드한 영상은 자동으로 여러 화질로 변환되고, 운영자 검수 후 게시돼요." />

      {latest && (
        <Panel title={`처리 현황 · ${latest.title}`} action={<Badge>{state.status}</Badge>}>
          <ol className="st-steps">
            {UPLOAD_STEPS.map((s, i) => (
              <li key={s} className={i < state.step ? 'done' : i === state.step ? 'now' : ''}>
                <b>{i < state.step ? '✓' : i + 1}</b>
                <strong>{s}</strong>
                <span>{STEP_DESC[i]}</span>
                {i === state.step && state.step < 2 && (
                  <div className="st-progress"><div style={{ width: `${Math.round(state.progress * 100)}%` }} /></div>
                )}
              </li>
            ))}
          </ol>
          {state.step === 2 && state.status === '검수 대기' && (
            <p className="st-msg">변환이 끝났어요. 운영자 검수를 기다리는 중이에요. (데모: <Link to="/admin/contents" className="st-link">관리자 콘솔</Link>에서 직접 승인해볼 수 있어요)</p>
          )}
        </Panel>
      )}

      <form className="st-grid st-grid--1-1" onSubmit={submit}>
        <Panel title="영상 파일">
          <div
            className={`st-drop ${drag ? 'is-drag' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <video src={preview} controls muted onClick={(e) => e.stopPropagation()} />
            ) : file ? (
              <p className="st-drop__file">🎬 {file.name}<br /><span>{bytes(file.size)}</span></p>
            ) : (
              <>
                <UploadIcon width={36} height={36} />
                <p>영상을 끌어다 놓거나 클릭해서 선택하세요</p>
                <span>MP4 · MOV · 최대 20GB (데모: 파일은 서버로 전송되지 않아요)</span>
              </>
            )}
            <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => pickFile(e.target.files[0])} />
          </div>
          {file && <p className="st-msg">{file.name} · {bytes(file.size)}</p>}
          <button type="button" className="btn btn--xs btn--outline" onClick={useSample}>샘플 파일로 테스트</button>
        </Panel>

        <Panel title="영상 정보">
          <div className="st-form">
            <label className="st-field"><span>제목</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={80} /></label>
            <div className="st-row">
              <label className="st-field">
                <span>유형</span>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
              </label>
              <label className="st-field">
                <span>관람 등급</span>
                <select value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}>
                  <option value="ALL">전체</option><option value="12">12세</option><option value="15">15세</option><option value="19">19세</option>
                </select>
              </label>
            </div>
            {form.type === '숏드라마 회차' && (
              <label className="st-field">
                <span>작품</span>
                <select value={form.series} onChange={(e) => setForm({ ...form, series: e.target.value })}>
                  {series.map((c) => <option key={c.id} value={c.id}>{c.title} (다음 회차: {c.episodes.length + 1}화)</option>)}
                  <option value="new">+ 새 작품 만들기</option>
                </select>
              </label>
            )}
            <label className="st-field"><span>설명</span><textarea rows={4} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} /></label>
            <div className="st-field">
              <span>공개 설정</span>
              <div className="st-seg">
                {VIS.map((v) => (
                  <button type="button" key={v} className={form.visibility === v ? 'is-active' : ''} onClick={() => setForm({ ...form, visibility: v })}>{v}</button>
                ))}
              </div>
            </div>
            {error && <p className="st-error">{error}</p>}
            <button className="btn btn--grad">업로드</button>
          </div>
        </Panel>
      </form>
    </>
  );
}
