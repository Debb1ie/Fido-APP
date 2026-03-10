import { useState, useRef, useEffect, useReducer, useCallback } from "react";

const DARK  = { bg:"#0d0d0d",panel:"#161616",border:"#272727",text:"#e8e8e8",muted:"#555",dim:"#333",accent:"#FF6B35",accentSoft:"rgba(255,107,53,0.12)",blue:"#4D9FFF",blueSoft:"rgba(77,159,255,0.12)",surface:"#1c1c1c",hover:"#232323",input:"#111",canvas:"#1a1a1a" };
const LIGHT = { bg:"#ebebeb",panel:"#ffffff",border:"#e2e2e2",text:"#1a1a1a",muted:"#888",dim:"#bbb",accent:"#e85d04",accentSoft:"rgba(232,93,4,0.1)",blue:"#1d4ed8",blueSoft:"rgba(29,78,216,0.1)",surface:"#f4f4f4",hover:"#ececec",input:"#fafafa",canvas:"#d8d8d8" };

const FONTS = ["Bebas Neue","Anton","Cinzel","Unbounded","Playfair Display","Raleway","Montserrat","Oswald","Pacifico","Lobster","Orbitron","Fjalla One","Righteous","DM Serif Display"];
const GRADIENTS = [["#FF6B6B","#FFE66D"],["#4ECDC4","#2C3E50"],["#D4145A","#FBB03B"],["#009FFF","#EC2F4B"],["#7F00FF","#E100FF"],["#00C9FF","#92FE9D"],["#FC466B","#3F5EFB"],["#43CEA2","#185A9D"],["#F7971E","#FFD200"],["#11998E","#38EF7D"],["#FC5C7D","#6A82FB"],["#C6EA8D","#FE90AF"]];
const PRESETS = [{name:"Logo",w:400,h:400},{name:"Banner",w:1200,h:400},{name:"Instagram",w:1080,h:1080},{name:"Story",w:1080,h:1920},{name:"Twitter Hdr",w:1500,h:500},{name:"Business Card",w:1050,h:600}];
const TEMPLATES = [
  { name:"Minimal Mark", layers:[
    {id:1,type:"rect",x:200,y:200,w:340,h:340,fill:"#0f0f0f",rx:18,rotation:0,opacity:1,stroke:"none",strokeW:0,name:"BG"},
    {id:2,type:"text",x:200,y:185,text:"NEXUS",font:"Bebas Neue",size:90,fill:"#ffffff",stroke:"none",strokeW:0,rotation:0,opacity:1,letterSpacing:14,bold:false,italic:false,name:"Title"},
    {id:3,type:"rect",x:200,y:222,w:150,h:2,fill:"#FF6B35",rx:1,rotation:0,opacity:1,stroke:"none",strokeW:0,name:"Rule"},
    {id:4,type:"text",x:200,y:248,text:"CREATIVE STUDIO",font:"Raleway",size:13,fill:"#888",stroke:"none",strokeW:0,rotation:0,opacity:1,letterSpacing:6,bold:false,italic:false,name:"Sub"},
  ]},
  { name:"Circle Bold", layers:[
    {id:1,type:"circle",x:200,y:200,w:320,h:320,fill:"#FF6B35",rotation:0,opacity:1,stroke:"none",strokeW:0,name:"Ring"},
    {id:2,type:"circle",x:200,y:200,w:278,h:278,fill:"#111",rotation:0,opacity:1,stroke:"none",strokeW:0,name:"Inner"},
    {id:3,type:"text",x:200,y:193,text:"DF",font:"Bebas Neue",size:120,fill:"#FF6B35",stroke:"none",strokeW:0,rotation:0,opacity:1,letterSpacing:10,bold:false,italic:false,name:"Mono"},
    {id:4,type:"text",x:200,y:247,text:"DESIGNFLOW",font:"Raleway",size:14,fill:"#aaa",stroke:"none",strokeW:0,rotation:0,opacity:1,letterSpacing:6,bold:true,italic:false,name:"Word"},
  ]},
  { name:"Geometric", layers:[
    {id:1,type:"rect",x:200,y:200,w:260,h:260,fill:"#FF6B35",rx:0,rotation:45,opacity:1,stroke:"none",strokeW:0,name:"Diamond"},
    {id:2,type:"rect",x:200,y:200,w:218,h:218,fill:"#111",rx:0,rotation:45,opacity:1,stroke:"none",strokeW:0,name:"Inner"},
    {id:3,type:"text",x:200,y:195,text:"MARK",font:"Cinzel",size:48,fill:"#fff",stroke:"none",strokeW:0,rotation:0,opacity:1,letterSpacing:10,bold:false,italic:false,name:"Title"},
    {id:4,type:"text",x:200,y:238,text:"DESIGN CO.",font:"Raleway",size:13,fill:"#aaa",stroke:"none",strokeW:0,rotation:0,opacity:1,letterSpacing:5,bold:false,italic:false,name:"Sub"},
  ]},
];

let _uid = 200;
const uid = () => `l${++_uid}`;

function reducer(state, action) {
  switch (action.type) {
    case "SET":    return action.p;
    case "ADD":    return [...state, action.p];
    case "UPDATE": return state.map(l => l.id === action.id ? { ...l, ...action.p } : l);
    case "DELETE": return state.filter(l => l.id !== action.id);
    case "DUP": {
      const src = state.find(l => l.id === action.id);
      if (!src) return state;
      return [...state, { ...JSON.parse(JSON.stringify(src)), id:uid(), x:src.x+20, y:src.y+20, name:src.name+" copy" }];
    }
    case "ORDER": {
      const i = state.findIndex(l => l.id === action.id);
      if (action.d==="up"   && i < state.length-1){ const n=[...state];[n[i],n[i+1]]=[n[i+1],n[i]];return n; }
      if (action.d==="down" && i > 0)             { const n=[...state];[n[i],n[i-1]]=[n[i-1],n[i]];return n; }
      return state;
    }
    default: return state;
  }
}

export default function App() {
  const INIT = TEMPLATES[0].layers.map(l=>({...l}));
  const [layers, dispatch] = useReducer(reducer, INIT);
  const [history, setHistory] = useState([INIT]);
  const [hIdx, setHIdx] = useState(0);
  const [dark, setDark] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tool, setTool] = useState("select");
  const [leftTab, setLeftTab] = useState("layers");
  const [rightTab, setRightTab] = useState("style");
  const [zoom, setZoom] = useState(1);
  const [cW, setCW] = useState(400);
  const [cH, setCH] = useState(400);
  const [cBg, setCBg] = useState("#0d0d0d");
  const [grid, setGrid] = useState(true);
  const [menu, setMenu] = useState(null);
  const [modal, setModal] = useState(null);
  const [origImg, setOrigImg] = useState(null);
  const [enhImg, setEnhImg] = useState(null);
  const [eSharp, setESharp] = useState(0);
  const [eBright, setEBright] = useState(100);
  const [eCont, setECont] = useState(100);
  const [eSat, setESat] = useState(100);
  const [eUp, setEUp] = useState("1x");
  const [enhancing, setEnhancing] = useState(false);

  const svgRef = useRef(null);
  const fileRef = useRef(null);
  const enhFileRef = useRef(null);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  const dragRef   = useRef(null);
  const resizeRef = useRef(null);
  const rotateRef = useRef(null);
  const cWRef = useRef(cW); cWRef.current = cW;
  const cHRef = useRef(cH); cHRef.current = cH;
  const zoomRef = useRef(zoom); zoomRef.current = zoom;
  const selRef = useRef(selected); selRef.current = selected;

  const T = dark ? DARK : LIGHT;
  const sel = layers.find(l => l.id === selected) || null;

  // history
  const snapshot = useCallback((ls) => {
    const copy = JSON.parse(JSON.stringify(ls));
    setHistory(prev => {
      const next = [...prev.slice(0, hIdx+1), copy];
      return next.slice(-40);
    });
    setHIdx(i => Math.min(i+1, 39));
  }, [hIdx]);

  const undo = useCallback(() => {
    if (hIdx <= 0) return;
    dispatch({ type:"SET", p: JSON.parse(JSON.stringify(history[hIdx-1])) });
    setHIdx(i => i-1);
    setSelected(null);
  }, [history, hIdx]);

  const redo = useCallback(() => {
    if (hIdx >= history.length-1) return;
    dispatch({ type:"SET", p: JSON.parse(JSON.stringify(history[hIdx+1])) });
    setHIdx(i => i+1);
    setSelected(null);
  }, [history, hIdx]);

  // add layer — stable ref, no stale cW/cH using refs
  const addLayer = useCallback((base) => {
    const id = uid();
    const layer = { id, opacity:1, rotation:0, locked:false, visible:true, stroke:"none", strokeW:0, ...base };
    dispatch({ type:"ADD", p: layer });
    setTimeout(() => {
      snapshot(layersRef.current);
    }, 0);
    setSelected(id);
    return id;
  }, [snapshot]);

  const addShape = useCallback((type) => {
    const cx = cWRef.current/2, cy = cHRef.current/2;
    if (type === "text") {
      addLayer({ type:"text", x:cx, y:cy, text:"Edit Text", font:"Bebas Neue", size:52, fill:"#ffffff", letterSpacing:2, bold:false, italic:false, name:"Text" });
    } else {
      addLayer({ type, x:cx, y:cy, w:100, h:100, fill:"#FF6B35", rx:0, name:type.charAt(0).toUpperCase()+type.slice(1) });
    }
  }, [addLayer]);

  const updateLayer = useCallback((id, props) => {
    dispatch({ type:"UPDATE", id, p: props });
  }, []);

  const commitUpdate = useCallback((id, props) => {
    dispatch({ type:"UPDATE", id, p: props });
    setTimeout(() => snapshot(layersRef.current), 0);
  }, [snapshot]);

  const applyTemplate = useCallback((tpl) => {
    const ls = tpl.layers.map(l => ({...l, visible:true, locked:false}));
    dispatch({ type:"SET", p: ls });
    snapshot(ls);
    setSelected(null);
    setModal(null);
  }, [snapshot]);

  // pointer events via refs — zero stale closure issues
  useEffect(() => {
    const onMove = (e) => {
      const z = zoomRef.current;
      if (dragRef.current) {
        const d = dragRef.current;
        dispatch({ type:"UPDATE", id:d.id, p:{ x: d.ox+(e.clientX-d.mx)/z, y: d.oy+(e.clientY-d.my)/z } });
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        const dx = (e.clientX-r.sx)/z, dy = (e.clientY-r.sy)/z;
        const nw = Math.max(8, r.ow+(r.pos.includes("e")?dx*2:-dx*2));
        const nh = Math.max(8, r.oh+(r.pos.includes("s")?dy*2:-dy*2));
        dispatch({ type:"UPDATE", id:r.id, p:{ w:nw, h:nh } });
      }
      if (rotateRef.current) {
        const rot = rotateRef.current;
        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;
        const cx = svgRect.left + (rot.ox/cWRef.current)*svgRect.width;
        const cy = svgRect.top  + (rot.oy/cHRef.current)*svgRect.height;
        const angle = Math.atan2(e.clientY-cy, e.clientX-cx)*180/Math.PI+90;
        dispatch({ type:"UPDATE", id:rot.id, p:{ rotation: angle } });
      }
    };
    const onUp = () => {
      if (dragRef.current)   { snapshot(layersRef.current); dragRef.current   = null; }
      if (resizeRef.current) { snapshot(layersRef.current); resizeRef.current = null; }
      if (rotateRef.current) { snapshot(layersRef.current); rotateRef.current = null; }
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup",   onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [snapshot]);

  // paste image
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const max=280; let w=img.width,h=img.height;
              if(w>max){h=h*max/w;w=max;} if(h>max){w=w*max/h;h=max;}
              addLayer({ type:"image", x:cWRef.current/2, y:cHRef.current/2, w, h, imgData:ev.target.result, name:"Pasted Image" });
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addLayer]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      const inInput = ["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName);
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="z") { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="y") { e.preventDefault(); redo(); return; }
      if ((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==="d") {
        e.preventDefault();
        const s = selRef.current;
        if (s) { dispatch({type:"DUP",id:s}); setTimeout(()=>snapshot(layersRef.current),0); }
        return;
      }
      if (inInput) return;
      if (e.key==="Delete"||e.key==="Backspace") {
        const s = selRef.current;
        if (s) { dispatch({type:"DELETE",id:s}); setTimeout(()=>snapshot(layersRef.current),0); setSelected(null); }
      }
      if (e.key==="Escape") { setSelected(null); setMenu(null); setModal(null); }
      if (!e.ctrlKey&&!e.metaKey) {
        if (e.key==="v") setTool("select");
        if (e.key==="h") setTool("hand");
        if (e.key==="r") { e.preventDefault(); addShape("rect"); }
        if (e.key==="t") { e.preventDefault(); addShape("text"); }
        if (e.key==="="||e.key==="+") setZoom(z=>Math.min(4,+(z+0.25).toFixed(2)));
        if (e.key==="-")               setZoom(z=>Math.max(0.1,+(z-0.25).toFixed(2)));
        if (e.key==="0")               setZoom(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, addShape, snapshot]);

  const handleImgUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const max=260; let w=img.width,h=img.height;
        if(w>max){h=h*max/w;w=max;} if(h>max){w=w*max/h;h=max;}
        addLayer({ type:"image", x:cW/2, y:cH/2, w, h, imgData:ev.target.result, name:file.name.slice(0,20) });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const applyEnhance = () => {
    if (!origImg) return;
    setEnhancing(true);
    const img = new Image();
    img.onload = () => {
      const scale = eUp==="4x"?4:eUp==="2x"?2:1;
      const c = document.createElement("canvas");
      c.width=img.width*scale; c.height=img.height*scale;
      const ctx=c.getContext("2d");
      ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high";
      ctx.filter=`brightness(${eBright}%) contrast(${eCont}%) saturate(${eSat}%)`;
      ctx.drawImage(img,0,0,c.width,c.height);
      if (eSharp>0) {
        const id=ctx.getImageData(0,0,c.width,c.height),px=id.data;
        const s=eSharp/90,k=[-s,-s,-s,-s,1+8*s,-s,-s,-s,-s];
        const tmp=new Uint8ClampedArray(px);
        for(let y=1;y<c.height-1;y++) for(let x=1;x<c.width-1;x++) for(let ch=0;ch<3;ch++){
          let v=0; for(let ky=-1;ky<=1;ky++) for(let kx=-1;kx<=1;kx++) v+=tmp[((y+ky)*c.width+(x+kx))*4+ch]*k[(ky+1)*3+(kx+1)];
          px[(y*c.width+x)*4+ch]=Math.max(0,Math.min(255,v));
        }
        ctx.putImageData(id,0,0);
      }
      setEnhImg(c.toDataURL("image/png")); setEnhancing(false);
    };
    img.src=origImg;
  };

  const exportSVG = () => {
    const blob=new Blob([svgRef.current.outerHTML],{type:"image/svg+xml"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="design.svg";a.click();
  };
  const exportPNG = (scale=3) => {
    const s=new XMLSerializer(),str=s.serializeToString(svgRef.current);
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement("canvas");c.width=cW*scale;c.height=cH*scale;
      const ctx=c.getContext("2d");ctx.scale(scale,scale);ctx.drawImage(img,0,0);
      const a=document.createElement("a");a.href=c.toDataURL("image/png");a.download="design.png";a.click();
    };
    img.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(str);
  };

  // SVG layer renderer
  const renderLayer = (l) => {
    if (!l.visible) return null;
    const isSel = l.id === selected;
    const fillAttr = l.gradientId ? `url(#${l.gradientId})` : (l.fill||"transparent");
    const strAttr  = (!l.stroke||l.stroke==="none") ? "none" : l.stroke;

    const onPD = (e) => {
      if (l.locked || tool==="hand") return;
      e.stopPropagation();
      setSelected(l.id);
      dragRef.current = { id:l.id, mx:e.clientX, my:e.clientY, ox:l.x, oy:l.y };
    };

    let shape = null;
    if      (l.type==="rect")     shape=<rect x={l.x-l.w/2} y={l.y-l.h/2} width={l.w} height={l.h} rx={l.rx||0} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW}/>;
    else if (l.type==="circle")   shape=<ellipse cx={l.x} cy={l.y} rx={l.w/2} ry={l.h/2} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW}/>;
    else if (l.type==="triangle") { const p=`${l.x},${l.y-l.h/2} ${l.x-l.w/2},${l.y+l.h/2} ${l.x+l.w/2},${l.y+l.h/2}`; shape=<polygon points={p} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW}/>; }
    else if (l.type==="star")     { const p=Array.from({length:10},(_,i)=>{const a=(i*Math.PI)/5-Math.PI/2,r=i%2?l.w/4:l.w/2;return `${l.x+r*Math.cos(a)},${l.y+r*Math.sin(a)}`;}).join(" "); shape=<polygon points={p} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW}/>; }
    else if (l.type==="hexagon")  { const p=Array.from({length:6},(_,i)=>{const a=i*Math.PI/3;return `${l.x+(l.w/2)*Math.cos(a)},${l.y+(l.h/2)*Math.sin(a)}`;}).join(" "); shape=<polygon points={p} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW}/>; }
    else if (l.type==="diamond")  { const p=`${l.x},${l.y-l.h/2} ${l.x+l.w/2},${l.y} ${l.x},${l.y+l.h/2} ${l.x-l.w/2},${l.y}`; shape=<polygon points={p} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW}/>; }
    else if (l.type==="text")     shape=<text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" fontFamily={`'${l.font}',sans-serif`} fontSize={l.size||36} fill={fillAttr} stroke={strAttr} strokeWidth={l.strokeW} fontWeight={l.bold?"bold":"normal"} fontStyle={l.italic?"italic":"normal"} letterSpacing={l.letterSpacing||0} style={{userSelect:"none"}}>{l.text}</text>;
    else if (l.type==="image"&&l.imgData) shape=<image href={l.imgData} x={l.x-l.w/2} y={l.y-l.h/2} width={l.w} height={l.h} preserveAspectRatio="xMidYMid slice"/>;
    if (!shape) return null;

    const bx = l.x-(l.type==="text"?100:l.w/2);
    const by = l.y-(l.type==="text"?(l.size||36)/2:l.h/2);
    const bw = l.type==="text"?200:l.w;
    const bh = l.type==="text"?l.size||36:l.h;

    return (
      <g key={l.id} transform={`rotate(${l.rotation||0},${l.x},${l.y})`} opacity={l.opacity??1}
         style={{cursor:l.locked?"not-allowed":tool==="hand"?"grab":"move"}}
         onPointerDown={onPD}>
        {shape}
        {isSel&&<>
          <rect x={bx-4} y={by-4} width={bw+8} height={bh+8} fill="none" stroke={T.blue} strokeWidth={1.5} rx={3} pointerEvents="none"/>
          {[["nw",bx,by],["ne",bx+bw,by],["sw",bx,by+bh],["se",bx+bw,by+bh]].map(([pos,hx,hy])=>(
            <rect key={pos} x={hx-5} y={hy-5} width={10} height={10} rx={2} fill={T.blue} stroke="#fff" strokeWidth={1.5} style={{cursor:"nwse-resize"}}
              onPointerDown={(e)=>{ e.stopPropagation(); resizeRef.current={id:l.id,pos,sx:e.clientX,sy:e.clientY,ow:l.w||200,oh:l.type==="text"?l.size||36:l.h||100}; }}/>
          ))}
          <line x1={bx+bw/2} y1={by-4} x2={bx+bw/2} y2={by-17} stroke={T.blue} strokeWidth={1.5} pointerEvents="none"/>
          <circle cx={bx+bw/2} cy={by-23} r={6} fill={T.blue} stroke="#fff" strokeWidth={1.5} style={{cursor:"grab"}}
            onPointerDown={(e)=>{ e.stopPropagation(); rotateRef.current={id:l.id,ox:l.x,oy:l.y}; }}/>
        </>}
      </g>
    );
  };

  // nav menu definitions
  const navMenus = {
    File:[
      {label:"New Canvas",     fn:()=>{dispatch({type:"SET",p:[]});setSelected(null);}},
      {label:"Load Template…", fn:()=>setModal("templates")},
      {sep:true},
      {label:"Export SVG",     fn:exportSVG},
      {label:"Export PNG (3×)",fn:()=>exportPNG(3)},
      {label:"Export HD PNG",  fn:()=>exportPNG(Math.ceil(1080/Math.min(cW,cH)))},
    ],
    Edit:[
      {label:"Undo  ⌘Z",     fn:undo,  dis:hIdx<=0},
      {label:"Redo  ⌘Y",     fn:redo,  dis:hIdx>=history.length-1},
      {sep:true},
      {label:"Duplicate  ⌘D",fn:()=>{ if(selected){dispatch({type:"DUP",id:selected});setTimeout(()=>snapshot(layersRef.current),0);} }},
      {label:"Delete  Del",  fn:()=>{ if(selected){dispatch({type:"DELETE",id:selected});setTimeout(()=>snapshot(layersRef.current),0);setSelected(null);} }},
    ],
    View:[
      {label:(grid?"✓ ":"  ")+"Grid",    fn:()=>setGrid(g=>!g)},
      {sep:true},
      {label:"Zoom In   +",   fn:()=>setZoom(z=>Math.min(4,+(z+0.25).toFixed(2)))},
      {label:"Zoom Out  −",   fn:()=>setZoom(z=>Math.max(0.1,+(z-0.25).toFixed(2)))},
      {label:"Reset 100%  0", fn:()=>setZoom(1)},
    ],
    Insert:[
      {label:"Rectangle  R",   fn:()=>addShape("rect")},
      {label:"Circle",          fn:()=>addShape("circle")},
      {label:"Triangle",        fn:()=>addShape("triangle")},
      {label:"Star",             fn:()=>addShape("star")},
      {label:"Hexagon",          fn:()=>addShape("hexagon")},
      {label:"Diamond",          fn:()=>addShape("diamond")},
      {sep:true},
      {label:"Text  T",          fn:()=>addShape("text")},
      {label:"Image…",           fn:()=>fileRef.current?.click()},
    ],
  };

  // shared micro-components
  const HR = () => <div style={{height:1,background:T.border,margin:"8px 0"}}/>;
  const SL = ({c}) => <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:T.dim,marginBottom:5,marginTop:2}}>{c}</div>;

  const Slid = ({label,value,min,max,step=1,set,unit=""}) => (
    <div style={{marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
        <span style={{fontSize:11,color:T.muted}}>{label}</span>
        <span style={{fontSize:11,color:T.accent,fontWeight:700}}>{Math.round(value)}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))} style={{width:"100%",accentColor:T.accent,cursor:"pointer"}}/>
    </div>
  );

  const CRow = ({label,value,set}) => (
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
      <span style={{fontSize:10,color:T.muted,width:42,flexShrink:0}}>{label}</span>
      <input type="color" value={(!value||value==="none"||value.startsWith("url"))?"#888":value} onChange={e=>set(e.target.value)}
        style={{width:26,height:24,borderRadius:4,border:`1px solid ${T.border}`,cursor:"pointer",flexShrink:0,padding:0}}/>
      <input type="text" value={value||""} onChange={e=>set(e.target.value)}
        style={{flex:1,padding:"4px 6px",borderRadius:4,border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:10,outline:"none",fontFamily:"monospace"}}/>
    </div>
  );

  const BtnStyle = (active,accent,danger) => ({
    display:"flex",alignItems:"center",justifyContent:"center",gap:4,
    borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer",transition:"all 0.1s",
    border: accent?"none":danger?`1px solid #e5333355`:`1px solid ${active?T.blue:T.border}`,
    background: accent?T.accent:danger?"#e5333315":active?T.blueSoft:"transparent",
    color: accent?"#fff":danger?"#e53":active?T.blue:T.muted,
  });

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,color:T.text,fontFamily:"'DM Sans',system-ui,sans-serif",overflow:"hidden",fontSize:12}}
      onClick={()=>setMenu(null)}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Cinzel:wght@400;700&family=Unbounded:wght@700;900&family=Playfair+Display:ital,wght@0,700;1,400&family=Raleway:wght@300;400;600;700&family=Montserrat:wght@300;400;600;700&family=Oswald:wght@400;700&family=Pacifico&family=Lobster&family=Orbitron:wght@400;700&family=Fjalla+One&family=Righteous&family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap" rel="stylesheet"/>

      {/* ═══ TITLE BAR ═══════════════════════════════════════════════════════ */}
      <div style={{display:"flex",alignItems:"center",background:T.panel,borderBottom:`1px solid ${T.border}`,height:42,flexShrink:0,position:"relative",zIndex:200}}
        onClick={e=>e.stopPropagation()}>

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",borderRight:`1px solid ${T.border}`,height:"100%",flexShrink:0}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect x="0"  y="0"  width="11" height="11" rx="2" fill={T.accent}/>
            <rect x="9"  y="9"  width="11" height="11" rx="2" fill={T.blue}/>
          </svg>
          <span style={{fontFamily:"'Unbounded',sans-serif",fontSize:10,fontWeight:900,letterSpacing:0,color:T.text,whiteSpace:"nowrap"}}>
            DESIGN<span style={{color:T.accent}}>FLOW</span>
          </span>
        </div>

        {/* Menus */}
        {Object.entries(navMenus).map(([name,items])=>(
          <div key={name} style={{position:"relative",height:"100%",display:"flex",alignItems:"center"}}>
            <button onClick={e=>{e.stopPropagation();setMenu(menu===name?null:name);}}
              onMouseEnter={()=>{if(menu&&menu!==name)setMenu(name);}}
              style={{padding:"0 12px",height:"100%",background:menu===name?T.surface:"transparent",border:"none",color:menu===name?T.text:T.muted,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all 0.1s"}}>
              {name}
            </button>
            {menu===name&&(
              <div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,background:T.panel,border:`1px solid ${T.border}`,borderRadius:8,minWidth:200,zIndex:999,padding:"4px 0",boxShadow:`0 8px 28px rgba(0,0,0,${dark?0.5:0.12})`}}>
                {items.map((it,i)=>it.sep
                  ? <div key={i} style={{height:1,background:T.border,margin:"3px 0"}}/>
                  : <button key={i} disabled={it.dis} onClick={()=>{it.fn();setMenu(null);}}
                      style={{display:"block",width:"100%",padding:"8px 16px",background:"transparent",border:"none",color:it.dis?T.dim:T.text,fontSize:12,textAlign:"left",cursor:it.dis?"not-allowed":"pointer",fontFamily:"inherit",opacity:it.dis?0.4:1}}
                      onMouseEnter={e=>{if(!it.dis)e.currentTarget.style.background=T.surface;}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
                      {it.label}
                    </button>
                )}
              </div>
            )}
          </div>
        ))}

        <div style={{flex:1,textAlign:"center",fontSize:11,color:T.muted,pointerEvents:"none"}}>
          Untitled — {cW}×{cH}px
        </div>

        <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 12px",flexShrink:0}}>
          <button onClick={()=>setZoom(z=>Math.max(0.1,+(z-0.25).toFixed(2)))} style={{width:24,height:24,borderRadius:4,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
          <div style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${T.border}`,background:T.surface,fontSize:11,fontWeight:700,minWidth:44,textAlign:"center"}}>{Math.round(zoom*100)}%</div>
          <button onClick={()=>setZoom(z=>Math.min(4,+(z+0.25).toFixed(2)))} style={{width:24,height:24,borderRadius:4,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          <div style={{width:1,height:18,background:T.border,margin:"0 4px"}}/>
          <button onClick={()=>setDark(d=>!d)} style={{padding:"4px 10px",borderRadius:16,border:`1px solid ${T.border}`,background:T.surface,color:T.muted,cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>
            {dark?"☀ Light":"◑ Dark"}
          </button>
        </div>
      </div>

      {/* ═══ TOOLBAR ════════════════════════════════════════════════════════ */}
      <div style={{display:"flex",alignItems:"center",background:T.panel,borderBottom:`1px solid ${T.border}`,height:38,flexShrink:0,padding:"0 8px",gap:1}}>
        {/* Select & Hand */}
        {[{id:"select",ic:"↖",tip:"Select (V)"},{id:"hand",ic:"✋",tip:"Pan (H)"}].map(t=>(
          <button key={t.id} title={t.tip} onClick={()=>setTool(t.id)}
            style={{width:30,height:28,borderRadius:5,border:`1px solid ${tool===t.id?T.blue:"transparent"}`,background:tool===t.id?T.blueSoft:"transparent",color:tool===t.id?T.blue:T.muted,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.1s"}}>
            {t.ic}
          </button>
        ))}
        <div style={{width:1,height:18,background:T.border,margin:"0 3px"}}/>

        {/* Shape buttons — clicking adds to canvas immediately */}
        {[{t:"rect",i:"▭"},{t:"circle",i:"○"},{t:"triangle",i:"△"},{t:"star",i:"☆"},{t:"hexagon",i:"⬡"},{t:"diamond",i:"◇"},{t:"text",i:"T"}].map(s=>(
          <button key={s.t} title={`Add ${s.t}`} onClick={()=>{ setTool("select"); addShape(s.t); }}
            style={{width:30,height:28,borderRadius:5,border:"1px solid transparent",background:"transparent",color:T.muted,cursor:"pointer",fontSize:s.t==="text"?14:13,fontWeight:s.t==="text"?"900":"normal",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.1s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.style.color=T.text;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.muted;}}>
            {s.i}
          </button>
        ))}
        <div style={{width:1,height:18,background:T.border,margin:"0 3px"}}/>

        <button onClick={()=>fileRef.current?.click()} title="Upload Image"
          style={{padding:"3px 9px",borderRadius:5,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",gap:3,transition:"all 0.1s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=T.surface;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
          🖼 Image
        </button>
        <div title="Paste image: Ctrl/Cmd+V" style={{padding:"3px 9px",borderRadius:5,border:`1px dashed ${T.border}`,color:T.dim,fontSize:11,display:"flex",alignItems:"center",gap:3,userSelect:"none"}}>
          ⌘V Paste
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImgUpload}/>

        <div style={{width:1,height:18,background:T.border,margin:"0 3px"}}/>
        {GRADIENTS.slice(0,8).map((g,i)=>(
          <div key={i} title={`Gradient ${i+1} — select a layer first`}
            onClick={()=>{if(!selected)return;const gId=`grad_${uid()}`;updateLayer(selected,{fill:`url(#${gId})`,gradientId:gId,gradColors:g});}}
            style={{width:18,height:18,borderRadius:3,background:`linear-gradient(135deg,${g[0]},${g[1]})`,cursor:selected?"pointer":"default",border:`1px solid ${T.border}`,flexShrink:0,opacity:selected?1:0.35,transition:"transform 0.1s"}}
            onMouseEnter={e=>{if(selected)e.currentTarget.style.transform="scale(1.25)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}/> 
        ))}

        <div style={{marginLeft:"auto",display:"flex",gap:4,flexShrink:0}}>
          <button onClick={()=>setModal("templates")} style={{...BtnStyle(false,false,false),padding:"4px 9px",fontSize:10}}>📋 Templates</button>
          <button onClick={()=>setModal("presets")}   style={{...BtnStyle(false,false,false),padding:"4px 9px",fontSize:10}}>⚙ Canvas</button>
          <button onClick={exportSVG}                  style={{...BtnStyle(false,false,false),padding:"4px 9px",fontSize:10}}>SVG</button>
          <button onClick={()=>exportPNG(3)}           style={{...BtnStyle(false,true,false),padding:"4px 10px",fontSize:10}}>Export PNG</button>
        </div>
      </div>

      {/* ═══ BODY ════════════════════════════════════════════════════════════ */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* LEFT PANEL */}
        <div style={{width:214,background:T.panel,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
            {[["layers","Layers"],["assets","Assets"],["enhance","Enhance"]].map(([id,lb])=>(
              <button key={id} onClick={()=>setLeftTab(id)}
                style={{flex:1,padding:"8px 0",background:"transparent",border:"none",borderBottom:leftTab===id?`2px solid ${T.accent}`:"2px solid transparent",color:leftTab===id?T.accent:T.muted,fontSize:11,fontWeight:600,cursor:"pointer",letterSpacing:0.2}}>
                {lb}
              </button>
            ))}
          </div>
          <div style={{flex:1,overflow:"auto",padding:"10px"}}>

            {leftTab==="layers"&&<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <SL c={`Layers (${layers.length})`}/>
                <button onClick={()=>addShape("rect")} style={{fontSize:10,padding:"2px 7px",borderRadius:4,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,cursor:"pointer"}}>+ Add</button>
              </div>
              {layers.length===0&&<p style={{color:T.dim,fontSize:11,textAlign:"center",marginTop:16}}>No layers yet.<br/>Add shapes from the toolbar.</p>}
              {[...layers].reverse().map(l=>(
                <div key={l.id} onClick={()=>setSelected(l.id===selected?null:l.id)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 7px",borderRadius:5,marginBottom:2,cursor:"pointer",background:l.id===selected?T.blueSoft:"transparent",border:`1px solid ${l.id===selected?T.blue:"transparent"}`,transition:"all 0.08s"}}
                  onMouseEnter={e=>{if(l.id!==selected)e.currentTarget.style.background=T.surface;}}
                  onMouseLeave={e=>{if(l.id!==selected)e.currentTarget.style.background="transparent";}}>
                  <span style={{fontSize:10,width:13,textAlign:"center",color:T.dim,flexShrink:0}}>
                    {l.type==="text"?"T":l.type==="image"?"🖼":l.type==="rect"?"▭":l.type==="circle"?"○":l.type==="star"?"☆":"◇"}
                  </span>
                  <div style={{width:9,height:9,borderRadius:2,flexShrink:0,background:l.gradColors?`linear-gradient(135deg,${l.gradColors[0]},${l.gradColors[1]})`:l.fill,border:`1px solid ${T.border}`}}/>
                  <span style={{flex:1,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:l.id===selected?T.blue:T.text}}>{l.name}</span>
                  <span onClick={e=>{e.stopPropagation();updateLayer(l.id,{visible:!l.visible});}} style={{cursor:"pointer",fontSize:10,color:l.visible?T.muted:T.dim,flexShrink:0,lineHeight:1}}>{l.visible?"👁":"◌"}</span>
                  <span onClick={e=>{e.stopPropagation();updateLayer(l.id,{locked:!l.locked});}} style={{cursor:"pointer",fontSize:9,color:l.locked?T.accent:T.dim,flexShrink:0,lineHeight:1}}>{l.locked?"🔒":"·"}</span>
                </div>
              ))}
            </>}

            {leftTab==="assets"&&<>
              <SL c="Templates"/>
              {TEMPLATES.map(tpl=>(
                <button key={tpl.name} onClick={()=>applyTemplate(tpl)}
                  style={{display:"flex",justifyContent:"space-between",alignItems:"center",width:"100%",padding:"8px 10px",marginBottom:4,borderRadius:5,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:11,cursor:"pointer",transition:"all 0.1s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;}}>
                  <span style={{fontWeight:600}}>{tpl.name}</span>
                  <span style={{fontSize:9,color:T.dim}}>{tpl.layers.length} layers</span>
                </button>
              ))}
              <HR/>
              <SL c="Shapes"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:8}}>
                {["rect","circle","triangle","star","hexagon","diamond","text"].map(s=>(
                  <button key={s} onClick={()=>addShape(s)}
                    style={{padding:"7px 4px",borderRadius:4,border:`1px solid ${T.border}`,background:T.surface,color:T.muted,fontSize:11,cursor:"pointer",textTransform:"capitalize",transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=T.hover;e.currentTarget.style.color=T.text;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=T.surface;e.currentTarget.style.color=T.muted;}}>
                    + {s}
                  </button>
                ))}
              </div>
              <HR/>
              <SL c="Gradients"/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {GRADIENTS.map((g,i)=>(
                  <div key={i} title="Select a layer first" onClick={()=>{if(!selected)return;const gId=`grad_${uid()}`;updateLayer(selected,{fill:`url(#${gId})`,gradientId:gId,gradColors:g});}}
                    style={{height:24,borderRadius:4,background:`linear-gradient(135deg,${g[0]},${g[1]})`,cursor:selected?"pointer":"default",border:`1px solid ${T.border}`,opacity:selected?1:0.45,transition:"transform 0.1s"}}
                    onMouseEnter={e=>{if(selected)e.currentTarget.style.transform="scale(1.08)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";}}/> 
                ))}
              </div>
            </>}

            {leftTab==="enhance"&&<>
              <SL c="Image Enhancer"/>
              <button onClick={()=>enhFileRef.current?.click()}
                style={{width:"100%",padding:"16px 0",borderRadius:7,border:`2px dashed ${T.border}`,background:T.surface,color:T.muted,fontSize:11,cursor:"pointer",marginBottom:10,textAlign:"center",transition:"border-color 0.1s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;}}>
                📤 Upload Image<br/><span style={{fontSize:9,color:T.dim}}>or paste with ⌘V</span>
              </button>
              <input ref={enhFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{setOrigImg(ev.target.result);setEnhImg(ev.target.result);};r.readAsDataURL(f);}}/>
              <HR/>
              <Slid label="Sharpness"  value={eSharp}  min={0}  max={100} set={setESharp}/>
              <Slid label="Brightness" value={eBright} min={50} max={200} set={setEBright} unit="%"/>
              <Slid label="Contrast"   value={eCont}   min={50} max={200} set={setECont}   unit="%"/>
              <Slid label="Saturation" value={eSat}    min={0}  max={300} set={setESat}    unit="%"/>
              <HR/>
              <SL c="Upscale"/>
              <div style={{display:"flex",gap:4,marginBottom:6}}>
                {["1x","2x","4x"].map(u=>(
                  <button key={u} onClick={()=>setEUp(u)}
                    style={{flex:1,padding:"6px 0",borderRadius:4,border:`1px solid ${eUp===u?T.accent:T.border}`,background:eUp===u?T.accentSoft:T.surface,color:eUp===u?T.accent:T.muted,fontSize:11,cursor:"pointer",fontWeight:700,transition:"all 0.1s"}}>
                    {u}
                  </button>
                ))}
              </div>
              <div style={{fontSize:9,color:T.dim,textAlign:"center",marginBottom:10}}>
                {eUp==="4x"?"Upscale to 1080p HD":eUp==="2x"?"2× resolution boost":"Original size"}
              </div>
              <button onClick={applyEnhance} disabled={!origImg||enhancing}
                style={{width:"100%",padding:"9px",borderRadius:7,border:"none",background:(!origImg||enhancing)?T.surface:`linear-gradient(135deg,${T.accent},#c44a00)`,color:(!origImg||enhancing)?T.dim:"#fff",fontWeight:700,fontSize:12,cursor:(!origImg||enhancing)?"not-allowed":"pointer",marginBottom:6}}>
                {enhancing?"Processing…":"✨ Enhance Image"}
              </button>
              {enhImg&&origImg&&(
                <button onClick={()=>{const a=document.createElement("a");a.href=enhImg;a.download="enhanced.png";a.click();}}
                  style={{width:"100%",padding:"7px",borderRadius:6,border:`1px solid ${T.accent}`,background:"transparent",color:T.accent,fontSize:11,cursor:"pointer",fontWeight:600}}>
                  ⬇ Download Enhanced
                </button>
              )}
            </>}
          </div>
        </div>

        {/* CANVAS */}
        <div style={{flex:1,overflow:"auto",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",background:dark?"#111":"#ccc"}}
          onPointerDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
          {grid&&<div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(${dark?"#2a2a2a":"#aaa"} 1px,transparent 1px)`,backgroundSize:"24px 24px",pointerEvents:"none"}}/>}

          {leftTab==="enhance"&&origImg ? (
            <div style={{display:"flex",gap:28,alignItems:"flex-start",padding:36,flexWrap:"wrap",justifyContent:"center"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:T.dim,marginBottom:7,fontWeight:800}}>ORIGINAL</div>
                <div style={{position:"relative",display:"inline-block"}}>
                  <img src={origImg} style={{maxWidth:320,maxHeight:480,borderRadius:7,border:`1px solid ${T.border}`,display:"block",filter:"blur(1.5px)",opacity:0.65}}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{background:"rgba(0,0,0,0.5)",color:"#fff",fontSize:9,fontWeight:800,letterSpacing:2,padding:"3px 8px",borderRadius:4}}>LOW QUALITY</span>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:80,gap:3}}>
                <span style={{fontSize:22,color:T.accent}}>→</span>
                <span style={{fontSize:9,color:T.dim,letterSpacing:1}}>ENHANCE</span>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,letterSpacing:1.5,textTransform:"uppercase",color:T.accent,marginBottom:7,fontWeight:800}}>ENHANCED {eUp==="4x"?"· HD":eUp==="2x"?"· 2×":""}</div>
                <img src={enhImg} style={{maxWidth:320,maxHeight:480,borderRadius:7,border:`1px solid ${T.accent}55`,display:"block",boxShadow:`0 0 20px ${T.accent}25`}}/>
              </div>
            </div>
          ) : (
            <div style={{transform:`scale(${zoom})`,transformOrigin:"center center",flexShrink:0,boxShadow:"0 8px 60px rgba(0,0,0,0.55)",transition:"transform 0.1s"}}>
              <svg ref={svgRef} width={cW} height={cH} style={{background:cBg,display:"block",cursor:tool==="hand"?"grab":"default"}}
                onPointerDown={e=>{if(e.target===e.currentTarget)setSelected(null);}}>
                <defs>
                  {layers.filter(l=>l.gradColors&&l.gradientId).map(l=>(
                    <linearGradient key={l.gradientId} id={l.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%"   stopColor={l.gradColors[0]}/>
                      <stop offset="100%" stopColor={l.gradColors[1]}/>
                    </linearGradient>
                  ))}
                </defs>
                {layers.map(renderLayer)}
              </svg>
            </div>
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{width:226,background:T.panel,borderLeft:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
          <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
            {[["style","Style"],["arrange","Arrange"],["canvas","Canvas"]].map(([id,lb])=>(
              <button key={id} onClick={()=>setRightTab(id)}
                style={{flex:1,padding:"8px 0",background:"transparent",border:"none",borderBottom:rightTab===id?`2px solid ${T.accent}`:"2px solid transparent",color:rightTab===id?T.accent:T.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>
                {lb}
              </button>
            ))}
          </div>
          <div style={{flex:1,overflow:"auto",padding:"12px"}}>

            {rightTab==="style"&&(sel ? <>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,padding:"6px 8px",borderRadius:5,background:T.surface,border:`1px solid ${T.border}`}}>
                <span style={{fontSize:10,color:T.dim}}>{sel.type==="text"?"T":sel.type==="image"?"🖼":sel.type==="rect"?"▭":"◇"}</span>
                <span style={{flex:1,fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",color:T.text}}>{sel.name}</span>
                <button title="Duplicate" onClick={()=>{dispatch({type:"DUP",id:sel.id});setTimeout(()=>snapshot(layersRef.current),0);}} style={{background:"transparent",border:"none",color:T.dim,cursor:"pointer",fontSize:12,padding:2}}>⧉</button>
                <button title="Delete" onClick={()=>{dispatch({type:"DELETE",id:sel.id});setTimeout(()=>snapshot(layersRef.current.filter(l=>l.id!==sel.id)),0);setSelected(null);}} style={{background:"transparent",border:"none",color:"#e53",cursor:"pointer",fontSize:12,padding:2}}>✕</button>
              </div>
              <SL c="Color"/>
              <CRow label="Fill"   value={sel.fill}  set={v=>updateLayer(sel.id,{fill:v,gradientId:null,gradColors:null})}/>
              {sel.type!=="image"&&<CRow label="Stroke" value={sel.stroke||"none"} set={v=>updateLayer(sel.id,{stroke:v})}/>}
              {sel.type!=="image"&&sel.stroke!=="none"&&<Slid label="Stroke W" value={sel.strokeW||0} min={0} max={24} set={v=>updateLayer(sel.id,{strokeW:v})}/>}
              {sel.type==="rect"&&<Slid label="Radius" value={sel.rx||0} min={0} max={Math.min(sel.w||100,sel.h||100)/2} set={v=>updateLayer(sel.id,{rx:v})}/>}
              <Slid label="Opacity" value={(sel.opacity??1)*100} min={0} max={100} set={v=>updateLayer(sel.id,{opacity:v/100})} unit="%"/>

              {sel.type==="text"&&<>
                <HR/>
                <SL c="Typography"/>
                <div style={{marginBottom:7}}>
                  <div style={{fontSize:10,color:T.dim,marginBottom:2}}>Content</div>
                  <textarea value={sel.text} rows={2} onChange={e=>updateLayer(sel.id,{text:e.target.value})}
                    style={{width:"100%",padding:"5px 7px",borderRadius:5,border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:12,boxSizing:"border-box",resize:"vertical",outline:"none",fontFamily:"inherit"}}/>
                </div>
                <div style={{marginBottom:7}}>
                  <div style={{fontSize:10,color:T.dim,marginBottom:2}}>Font</div>
                  <select value={sel.font} onChange={e=>updateLayer(sel.id,{font:e.target.value})}
                    style={{width:"100%",padding:"5px 6px",borderRadius:5,border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:11,outline:"none"}}>
                    {FONTS.map(f=><option key={f}>{f}</option>)}
                  </select>
                </div>
                <Slid label="Font Size"     value={sel.size||36}         min={6}  max={240} set={v=>updateLayer(sel.id,{size:v})} unit="px"/>
                <Slid label="Letter Spacing" value={sel.letterSpacing||0} min={-5} max={50}  set={v=>updateLayer(sel.id,{letterSpacing:v})} unit="px"/>
                <div style={{display:"flex",gap:5,marginTop:2}}>
                  {[["B","bold","bold"],["I","italic","italic"]].map(([lbl,prop,style])=>(
                    <button key={prop} onClick={()=>updateLayer(sel.id,{[prop]:!sel[prop]})}
                      style={{flex:1,padding:"5px",borderRadius:4,border:`1px solid ${sel[prop]?T.accent:T.border}`,background:sel[prop]?T.accentSoft:"transparent",color:sel[prop]?T.accent:T.muted,fontWeight:prop==="bold"?"bold":"normal",fontStyle:prop==="italic"?"italic":"normal",fontSize:13,cursor:"pointer"}}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </>}

              <HR/>
              <SL c="Gradients"/>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {GRADIENTS.map((g,i)=>(
                  <div key={i} onClick={()=>{const gId=`grad_${uid()}`;updateLayer(sel.id,{fill:`url(#${gId})`,gradientId:gId,gradColors:g});}}
                    style={{height:22,borderRadius:4,background:`linear-gradient(135deg,${g[0]},${g[1]})`,cursor:"pointer",border:`1px solid ${T.border}`,transition:"transform 0.1s"}}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}/>
                ))}
              </div>
            </> : <div style={{color:T.dim,fontSize:11,textAlign:"center",paddingTop:48,lineHeight:2}}>Click a layer<br/>to edit its style.</div>)}

            {rightTab==="arrange"&&(sel ? <>
              <SL c="Position & Size"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
                {["x","y",...(sel.type!=="text"?["w","h"]:[])].map(prop=>(
                  <div key={prop}>
                    <div style={{fontSize:9,color:T.dim,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>{prop}</div>
                    <input type="number" value={Math.round(sel[prop]||0)} onChange={e=>commitUpdate(sel.id,{[prop]:Number(e.target.value)})}
                      style={{width:"100%",padding:"5px 6px",borderRadius:4,border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:11,boxSizing:"border-box",outline:"none"}}/>
                  </div>
                ))}
              </div>
              <Slid label="Rotation" value={sel.rotation||0} min={0} max={360} set={v=>updateLayer(sel.id,{rotation:v})} unit="°"/>
              <HR/>
              <SL c="Layer Order"/>
              <div style={{display:"flex",gap:5,marginBottom:8}}>
                <button onClick={()=>dispatch({type:"ORDER",id:sel.id,d:"up"})}   style={{...BtnStyle(false,false,false),flex:1,padding:"6px"}}>▲ Forward</button>
                <button onClick={()=>dispatch({type:"ORDER",id:sel.id,d:"down"})} style={{...BtnStyle(false,false,false),flex:1,padding:"6px"}}>▼ Back</button>
              </div>
              <HR/>
              <button onClick={()=>{dispatch({type:"DUP",id:sel.id});setTimeout(()=>snapshot(layersRef.current),0);}}
                style={{...BtnStyle(false,false,false),width:"100%",padding:"7px",marginBottom:5}}>⧉ Duplicate</button>
              <button onClick={()=>{dispatch({type:"DELETE",id:sel.id});setTimeout(()=>snapshot(layersRef.current.filter(l=>l.id!==sel.id)),0);setSelected(null);}}
                style={{...BtnStyle(false,false,true),width:"100%",padding:"7px"}}>Delete Layer</button>
            </> : <div style={{color:T.dim,fontSize:11,textAlign:"center",paddingTop:48,lineHeight:2}}>Select a layer<br/>to arrange it.</div>)}

            {rightTab==="canvas"&&<>
              <SL c="Size"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
                {[["W",cW,setCW],["H",cH,setCH]].map(([lb,val,setter])=>(
                  <div key={lb}>
                    <div style={{fontSize:9,color:T.dim,marginBottom:2,textTransform:"uppercase",letterSpacing:1}}>{lb}</div>
                    <input type="number" value={val} onChange={e=>setter(Number(e.target.value))}
                      style={{width:"100%",padding:"5px 6px",borderRadius:4,border:`1px solid ${T.border}`,background:T.input,color:T.text,fontSize:11,boxSizing:"border-box",outline:"none"}}/>
                  </div>
                ))}
              </div>
              <CRow label="Bg" value={cBg} set={setCBg}/>
              <HR/>
              <SL c="Presets"/>
              {PRESETS.map(p=>(
                <button key={p.name} onClick={()=>{setCW(p.w);setCH(p.h);}}
                  style={{display:"flex",justifyContent:"space-between",width:"100%",padding:"7px 9px",marginBottom:3,borderRadius:4,border:`1px solid ${T.border}`,background:T.surface,color:T.text,fontSize:11,cursor:"pointer",transition:"all 0.1s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.background=T.hover;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
                  <span style={{fontWeight:600}}>{p.name}</span>
                  <span style={{color:T.dim,fontSize:10}}>{p.w}×{p.h}</span>
                </button>
              ))}
              <HR/>
              <button onClick={()=>setGrid(g=>!g)}
                style={{...BtnStyle(grid,false,false),width:"100%",padding:"7px"}}>
                {grid?"✓ Grid On":"Grid Off"}
              </button>
            </>}
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div style={{display:"flex",alignItems:"center",gap:14,background:T.panel,borderTop:`1px solid ${T.border}`,height:22,padding:"0 12px",flexShrink:0}}>
        <span style={{fontSize:10,color:T.dim}}>{layers.length} layers</span>
        {sel&&<span style={{fontSize:10,color:T.dim}}>• <span style={{color:T.text}}>{sel.name}</span></span>}
        <span style={{fontSize:10,color:T.dim}}>{cW}×{cH}px</span>
        <span style={{marginLeft:"auto",fontSize:10,color:T.dim}}>V=select · H=pan · R=rect · T=text · Del=delete · ⌘Z/Y · ⌘V=paste image</span>
      </div>

      {/* MODALS */}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setModal(null)}>
          <div style={{background:T.panel,border:`1px solid ${T.border}`,borderRadius:12,padding:26,minWidth:380,maxWidth:540,boxShadow:`0 20px 56px rgba(0,0,0,${dark?0.6:0.18})`}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <span style={{fontSize:15,fontWeight:700,color:T.text}}>{modal==="templates"?"Logo Templates":"Canvas Presets"}</span>
              <button onClick={()=>setModal(null)} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:20,lineHeight:1}}>✕</button>
            </div>
            {modal==="templates"&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {TEMPLATES.map(tpl=>(
                  <button key={tpl.name} onClick={()=>applyTemplate(tpl)}
                    style={{padding:"14px 8px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.1s",textAlign:"center"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.background=T.hover;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
                    {tpl.name}<br/><span style={{fontSize:9,color:T.dim,fontWeight:400}}>{tpl.layers.length} layers</span>
                  </button>
                ))}
              </div>
            )}
            {modal==="presets"&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {PRESETS.map(p=>(
                  <button key={p.name} onClick={()=>{setCW(p.w);setCH(p.h);setModal(null);}}
                    style={{display:"flex",justifyContent:"space-between",padding:"11px 13px",borderRadius:7,border:`1px solid ${T.border}`,background:T.surface,color:T.text,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.background=T.hover;}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surface;}}>
                    <span>{p.name}</span><span style={{color:T.dim,fontSize:10}}>{p.w}×{p.h}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
