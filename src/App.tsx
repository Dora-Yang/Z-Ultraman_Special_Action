// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Zap, MapPin, Battery, Star, Eye, Hand, Activity, CheckCircle, ChevronRight, ChevronLeft, Fingerprint, PenTool, Trees, Home, Swords, Volume2, Eraser, RotateCcw, Plus, Trash2, Copy } from 'lucide-react';

// --- Utility Components ---

const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false, size = 'md' }) => {
  const baseStyle = "rounded-xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2";
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 md:px-6 py-3 md:py-4 text-base md:text-lg"
  };
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] border border-cyan-400",
    secondary: "bg-slate-800 text-cyan-400 border border-cyan-800 hover:bg-slate-700 hover:border-cyan-500",
    danger: "bg-red-900/50 text-red-200 border border-red-500/50 hover:bg-red-900",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800",
    icon: "p-2 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 border border-slate-600"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${sizes[size] || sizes.md} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Handwriting Component (Canvas) ---

const DrawingPad = ({ id, label, desc, onSave, savedData, isCustom, onDelete, onLabelChange, onAddSibling }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  // Initialize canvas with saved data if available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && savedData) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = savedData;
      setHasContent(true);
    }
  }, []);

  // Handle Resize to keep canvas sharp
  useEffect(() => {
      const handleResize = () => {
          if (containerRef.current && canvasRef.current) {
             const { width, height } = containerRef.current.getBoundingClientRect();
             const canvas = canvasRef.current;
             if (Math.abs(canvas.width - width) > 10 || Math.abs(canvas.height - height) > 10) {
                 const saved = canvas.toDataURL();
                 canvas.width = width;
                 canvas.height = height;
                 const img = new Image();
                 img.onload = () => canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                 img.src = saved;
             }
          }
      };
      if (containerRef.current && canvasRef.current) {
          const { width, height } = containerRef.current.getBoundingClientRect();
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          if (savedData) {
             const ctx = canvasRef.current.getContext('2d');
             const img = new Image();
             img.onload = () => ctx.drawImage(img, 0, 0, width, height);
             img.src = savedData;
          }
      }
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [savedData]);


  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#facc15'; // Yellow color
    ctx.lineWidth = 6; 
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasContent(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { offsetX, offsetY } = getCoordinates(e, canvas);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvas();
    }
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onSave(dataUrl);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onSave(null);
  };

  const getCoordinates = (e, canvas) => {
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top
    };
  };

  return (
    <div className="flex flex-col bg-slate-800 rounded-2xl p-3 border border-cyan-800 shadow-xl mb-6 relative overflow-visible group">
       {/* Header Row */}
       <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex items-center gap-2">
              {isCustom ? (
                  <div className="flex items-center gap-1 bg-slate-900 rounded p-1 border border-cyan-700">
                      <span className="text-yellow-500 font-bold px-1">[</span>
                      <input 
                        type="text" 
                        value={label} 
                        onChange={(e) => onLabelChange && onLabelChange(e.target.value)}
                        placeholder="?"
                        className="w-16 bg-transparent text-yellow-400 font-black text-2xl text-center focus:outline-none"
                        maxLength={1}
                      />
                      <span className="text-yellow-500 font-bold px-1">]</span>
                  </div>
              ) : (
                  <div className="text-3xl font-black text-yellow-400 drop-shadow-md">[{label}]</div>
              )}
              <div className="text-sm text-cyan-200">{desc}</div>
          </div>
          
          <div className="flex gap-2">
             {/* Add Button - Adds a sibling copy below */}
            <button 
                onClick={onAddSibling} 
                className="p-2 rounded-full bg-green-900/50 text-green-400 hover:bg-green-800 border border-green-800 transition-colors" 
                title="再加一个"
            >
                <Plus size={18} />
            </button>

            {hasContent && (
                <button onClick={clearCanvas} className="p-2 rounded-full bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors" title="重写">
                <RotateCcw size={18} />
                </button>
            )}
            {isCustom && onDelete && (
                <button onClick={onDelete} className="p-2 rounded-full bg-red-900/50 text-red-400 hover:bg-red-900 border border-red-900 transition-colors" title="删除">
                    <Trash2 size={18} />
                </button>
            )}
          </div>
       </div>
       
       {/* Canvas Area */}
       <div 
          ref={containerRef}
          className="relative border-4 border-dashed border-slate-600 rounded-xl bg-slate-900 touch-none h-64 md:h-80 w-full cursor-crosshair overflow-hidden"
       >
          {/* Background grid lines (米字格) */}
          <div className="absolute inset-0 pointer-events-none opacity-30 flex items-center justify-center">
             <div className="w-full h-[2px] bg-red-500/50"></div>
             <div className="absolute h-full w-[2px] bg-red-500/50"></div>
             <div className="absolute w-[140%] h-[2px] bg-red-500/30 rotate-45"></div>
             <div className="absolute w-[140%] h-[2px] bg-red-500/30 -rotate-45"></div>
             <div className="absolute inset-2 border-2 border-red-500/20 rounded"></div>
          </div>
          
          <canvas
            ref={canvasRef}
            className="relative z-10 touch-none w-full h-full"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => { e.preventDefault(); startDrawing(e); }}
            onTouchMove={(e) => { e.preventDefault(); draw(e); }}
            onTouchEnd={stopDrawing}
          />

          {!hasContent && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                 <span className="text-slate-500 text-lg">在此书写</span>
             </div>
          )}
       </div>
    </div>
  );
};

// --- Dynamic List Component (Updated Logic) ---

const DynamicRadarList = ({ defaultItems, pageKey, userData, setUserData }) => {
    // We use userData.pageLayouts to store the ORDER and LIST of items for each page
    // If it doesn't exist yet, we initialize it with defaultItems
    const items = userData.pageLayouts?.[pageKey] || defaultItems;

    // Initialize layout in state if missing
    useEffect(() => {
        if (!userData.pageLayouts?.[pageKey]) {
            setUserData(prev => ({
                ...prev,
                pageLayouts: {
                    ...prev.pageLayouts,
                    [pageKey]: defaultItems
                }
            }));
        }
    }, [pageKey]);

    const handleSave = (id, dataUrl) => {
        setUserData(prev => ({
            ...prev,
            radarData: { ...prev.radarData, [id]: dataUrl }
        }));
    };

    // Insert a copy of the item at the specific index
    const handleAddSibling = (index, templateItem) => {
        const newItem = {
            id: `${pageKey}_copy_${Date.now()}`,
            label: templateItem.label, // Inherit label (e.g., '口')
            desc: templateItem.desc,   // Inherit desc
            isCustom: true             // Mark as custom so it can be deleted
        };

        const currentList = userData.pageLayouts?.[pageKey] || defaultItems;
        const newList = [
            ...currentList.slice(0, index + 1),
            newItem,
            ...currentList.slice(index + 1)
        ];

        setUserData(prev => ({
            ...prev,
            pageLayouts: {
                ...prev.pageLayouts,
                [pageKey]: newList
            }
        }));
    };

    // Add a completely blank "Free" item at the end
    const handleAddFree = () => {
        const newItem = {
            id: `${pageKey}_free_${Date.now()}`,
            label: '',
            desc: '自由搜集',
            isCustom: true
        };

        const currentList = userData.pageLayouts?.[pageKey] || defaultItems;
        const newList = [...currentList, newItem];

        setUserData(prev => ({
            ...prev,
            pageLayouts: {
                ...prev.pageLayouts,
                [pageKey]: newList
            }
        }));
    };

    const handleDelete = (id) => {
        setUserData(prev => {
            // Remove data
            const newRadarData = { ...prev.radarData };
            delete newRadarData[id];
            
            // Remove from layout list
            const currentList = prev.pageLayouts[pageKey];
            const newList = currentList.filter(item => item.id !== id);
            
            return {
                ...prev,
                radarData: newRadarData,
                pageLayouts: {
                    ...prev.pageLayouts,
                    [pageKey]: newList
                }
            };
        });
    };

    const handleLabelChange = (id, newLabel) => {
        setUserData(prev => {
            const currentList = prev.pageLayouts[pageKey];
            const newList = currentList.map(item => 
                item.id === id ? { ...item, label: newLabel } : item
            );
            return {
                ...prev,
                pageLayouts: {
                    ...prev.pageLayouts,
                    [pageKey]: newList
                }
            };
        });
    };

    return (
        <div className="flex flex-col gap-2">
            {items.map((item, index) => (
                <DrawingPad
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    desc={item.desc}
                    savedData={userData.radarData[item.id]}
                    onSave={(data) => handleSave(item.id, data)}
                    isCustom={item.isCustom}
                    onDelete={() => handleDelete(item.id)}
                    onLabelChange={(val) => handleLabelChange(item.id, val)}
                    onAddSibling={() => handleAddSibling(index, item)}
                />
            ))}
            
            <Button 
                onClick={handleAddFree} 
                variant="secondary" 
                className="w-full mt-4 border-dashed border-2 bg-slate-900/50 hover:bg-slate-800 py-4"
            >
                <Plus size={24} />
                搜集新零件 (添加空白格)
            </Button>
        </div>
    );
};

const MissionImage = ({ alt, src, overlayText }) => (
  <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-6 border-2 border-cyan-500/30 group shadow-[0_0_20px_rgba(6,182,212,0.2)]">
    <img 
        src={src || `https://placehold.co/800x400/0f172a/22d3ee?text=${encodeURIComponent(alt)}`} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x400/0f172a/22d3ee?text=${encodeURIComponent(alt)}`; }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
    
    {/* Tech Overlay Lines */}
    <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-yellow-400"></div>
    <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-yellow-400"></div>
    
    <div className="absolute bottom-4 left-4 right-4">
      {overlayText && <div className="text-yellow-400 text-xs font-mono mb-1 tracking-widest uppercase">Target Locked</div>}
      <h3 className="text-white text-lg font-bold drop-shadow-md">{overlayText || alt}</h3>
    </div>
  </div>
);

const HeroMessage = ({ hero, message, avatarColor = "bg-blue-500" }) => (
  <div className="bg-slate-900/80 border-l-4 border-cyan-400 p-4 rounded-r-lg mb-6 flex gap-4 items-start shadow-lg backdrop-blur-sm">
    <div className={`w-12 h-12 rounded-full ${avatarColor} flex-shrink-0 flex items-center justify-center shadow-[0_0_15px_currentColor]`}>
       <span className="text-xl">🦸</span>
    </div>
    <div>
      <h4 className="text-cyan-400 font-bold text-sm mb-1 uppercase tracking-wider">{hero} 发来指令：</h4>
      <p className="text-slate-100 text-sm leading-relaxed">“{message}”</p>
    </div>
  </div>
);

const Card = ({ children, className = '', title, icon: Icon }) => (
  <div className={`bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-2xl relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 opacity-50"></div>
    {title && (
      <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-yellow-400" />}
        {title}
      </h3>
    )}
    {children}
  </div>
);

const InputField = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="block text-cyan-400 text-xs font-bold mb-2 uppercase tracking-wider">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-950 border border-cyan-700 text-white rounded-lg p-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors placeholder-slate-600 text-center"
      placeholder={placeholder}
    />
  </div>
);

const ChallengeTimer = ({ duration, label }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    setTimeLeft(duration);
    setIsActive(true);
  };

  return (
    <div className="mt-4 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-yellow-500/30">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-yellow-400 font-bold flex items-center gap-2 text-sm">
          <Zap size={16} /> 感统微挑战
        </h4>
        <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-0.5 rounded">身体激活</span>
      </div>
      <p className="text-sm text-slate-300 mb-4">{label}</p>
      
      <div className="flex items-center gap-3">
        <div className="text-3xl font-mono text-cyan-400 w-16 text-center bg-black/40 rounded py-1">
          {timeLeft === null ? duration : timeLeft}
          <span className="text-xs text-slate-500 ml-1">s</span>
        </div>
        <Button onClick={startTimer} variant={isActive ? 'secondary' : 'primary'} disabled={isActive} className="flex-1">
          {isActive ? '挑战中...' : '开始计时'}
        </Button>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function UltramanMission() {
  const [page, setPage] = useState(0);
  const [userData, setUserData] = useState({
    agentName: '',
    fingerprintActive: false,
    radarData: {}, 
    pageLayouts: {}, // Stores the full list of items (including copies) per page
    reports: {},
    totalEnergy: 0
  });

  const totalPages = 9; 

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
    window.scrollTo(0, 0);
  };

  const updateReport = (key, value) => {
    setUserData(prev => ({
      ...prev,
      reports: { ...prev.reports, [key]: value }
    }));
  };

  const collectedCount = Object.values(userData.radarData).filter(v => v !== null).length;

  // --- Page Renderers ---

  const renderCover = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20 rounded-full"></div>
        {/* Placeholder for 3 Ultramen + Fujian Map */}
        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 mx-auto">
             <img src="/images/ultraman-cover.png" alt="Three Ultramen" className="rounded-full border-4 border-cyan-400 shadow-[0_0_30px_#22d3ee] w-full h-full object-cover" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Shield size={100} className="text-white/20" />
             </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] uppercase italic">
          Z-特种行动
        </h1>
        <h2 className="text-lg md:text-2xl text-yellow-400 font-bold mt-2 tracking-[0.2em] uppercase">
          福建星系 · 能量搜集手册
        </h2>
      </div>

      <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur p-6 rounded-xl border border-blue-500/50 shadow-2xl">
        <label className="block text-cyan-400 mb-2 font-mono text-xs uppercase tracking-widest">Authorized Personnel Only</label>
        <div className="flex gap-2">
            <div className="bg-slate-800 text-slate-500 p-3 rounded font-mono select-none">ID-</div>
            <input 
            type="text" 
            value={userData.agentName}
            onChange={(e) => setUserData({...userData, agentName: e.target.value})}
            className="flex-1 bg-slate-950 border-b-2 border-cyan-500 text-white text-xl p-2 focus:outline-none focus:border-yellow-400 transition-colors placeholder-slate-700"
            placeholder="输入特工代号"
            />
        </div>
      </div>

      <Button onClick={handleNext} disabled={!userData.agentName} className="w-full max-w-xs text-lg py-4 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
        {userData.agentName ? "INITIATE MISSION" : "WAITING FOR ID..."}
      </Button>
    </div>
  );

  const renderPage1 = () => (
    <div className="space-y-6">
      <Card className="border-red-500/50 bg-red-950/20">
        <div className="flex items-center justify-between border-b border-red-900/50 pb-2 mb-4">
          <span className="text-red-500 font-black tracking-widest animate-pulse flex items-center gap-2">
            <Activity size={18} /> TOP SECRET
          </span>
          <span className="text-xs text-red-400/60 font-mono">ENCRYPTED: M78-NEBULA</span>
        </div>
        
        <MissionImage alt="Hologram Transmission" overlayText="光之国作战总部" src="/images/m78-base.png" />

        <p className="text-cyan-100 leading-relaxed text-lg font-light">
          呼叫地球少年 <span className="text-yellow-400 font-bold border-b border-yellow-400">{userData.agentName}</span>！<br/><br/>
          这里是光之国作战总部。福建星系正在遭受<span className="text-red-400 font-bold">“遗忘怪兽”</span>的攻击，许多汉字机甲被打散成了零件！<br/><br/>
          你的特质—— <b>超强观察力</b> 和 <b>乐高构建力</b>，正是我们需要的。
        </p>
      </Card>

      <div className="bg-slate-900 p-6 rounded-xl border border-cyan-900 text-center space-y-6">
        <p className="text-cyan-500 text-xs uppercase tracking-[0.3em]">Identity Verification</p>
        
        <div className="relative group cursor-pointer inline-block" onClick={() => setUserData({...userData, fingerprintActive: true})}>
            <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-700 relative overflow-hidden ${userData.fingerprintActive ? 'border-green-500 shadow-[0_0_40px_#22c55e]' : 'border-red-500 shadow-[0_0_20px_#ef4444] animate-pulse'}`}>
                 <div className={`absolute inset-0 bg-green-500/20 transition-transform duration-1000 ${userData.fingerprintActive ? 'translate-y-0' : 'translate-y-full'}`}></div>
                 <Fingerprint size={60} className={`relative z-10 transition-colors ${userData.fingerprintActive ? "text-green-400" : "text-red-500"}`} />
            </div>
            {!userData.fingerprintActive && <div className="text-xs text-red-500 mt-2 animate-bounce">点击按压指纹</div>}
        </div>

        {userData.fingerprintActive && (
          <div className="animate-fadeIn space-y-4">
            <div className="text-green-400 font-mono font-bold text-lg tracking-widest">[ ACCESS GRANTED ]</div>
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-lg border-l-4 border-yellow-500 text-left">
              <p className="text-slate-400 text-xs mb-1 uppercase">Mission Motto</p>
              <h3 className="text-xl md:text-2xl font-black text-yellow-400 italic">“遇到事情不能坐以待毙！”</h3>
            </div>
            <Button onClick={handleNext} className="w-full">立即出击</Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg transform -rotate-3">
           <span className="text-2xl">🛠</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white uppercase italic">Boot Camp</h2>
          <p className="text-cyan-400 text-sm">新兵训练营 / 装备库</p>
        </div>
      </div>

      <HeroMessage hero="艾克斯奥特曼" avatarColor="bg-yellow-600" message="听着，新兵！汉字不是画，是可以拆装的乐高机甲！" />

      <Card title="汉字机甲组装说明" icon={PenTool}>
        <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-700 flex flex-col items-center gap-4 my-2">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-900/50 rounded border border-blue-500 flex items-center justify-center text-xl md:text-2xl font-bold text-blue-200">扌</div>
                <span className="text-[10px] text-slate-500">零件A</span>
            </div>
            <span className="text-xl text-slate-600">+</span>
            <div className="text-center">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-900/50 rounded border border-blue-500 flex items-center justify-center text-xl md:text-2xl font-bold text-blue-200">丁</div>
                <span className="text-[10px] text-slate-500">零件B</span>
            </div>
            <span className="text-xl text-slate-600">=</span>
            <div className="text-center">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-yellow-500 to-red-600 rounded-lg border-2 border-yellow-400 flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-[0_0_20px_#ca8a04]">打</div>
                <span className="text-[10px] text-yellow-500 font-bold">战斗形态</span>
            </div>
          </div>
          <div className="w-full h-[1px] bg-slate-800"></div>
          <p className="text-xs text-slate-400 text-center">试着在空中用手指把它们拼起来！</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-800 p-4 rounded border-l-4 border-cyan-500 relative overflow-hidden">
                <Eye size={40} className="absolute -right-2 -bottom-2 text-cyan-900" />
                <h4 className="font-bold text-white text-sm mb-1">超级视力</h4>
                <p className="text-xs text-slate-400">发现躲藏在招牌、路牌里的零件。</p>
            </div>
            <div className="bg-slate-800 p-4 rounded border-l-4 border-yellow-500 relative overflow-hidden">
                <PenTool size={40} className="absolute -right-2 -bottom-2 text-yellow-900" />
                <h4 className="font-bold text-white text-sm mb-1">能量画笔</h4>
                <p className="text-xs text-slate-400">将捕获的零件画在雷达格里。</p>
            </div>
        </div>
      </Card>
      
      <Button onClick={handleNext} className="w-full">装备确认，出发！</Button>
    </div>
  );

  const renderPage3 = () => (
    <div className="space-y-4">
        <MissionImage 
            src="/images/zhangzhou-city.png" 
            alt="Zhangzhou Ancient City" 
            overlayText="第1站：漳州古城 (闹市潜行)" 
        />

        <HeroMessage hero="银河奥特曼" avatarColor="bg-purple-600" message="这里的街道充满了烟火气！开启你的雷达，注意街道两边的‘招牌’！" />

        <Card title="零件雷达 (请写入汉字)" icon={Activity}>
             <DynamicRadarList 
                pageKey="page3"
                defaultItems={[
                    {id: '口', label: '口', desc: '嘴巴/入口'},
                    {id: '火', label: '火', desc: '热能/灯光'},
                    {id: '扌', label: '扌', desc: '动作/抓取'}
                ]}
                userData={userData}
                setUserData={setUserData}
             />
        </Card>

        <Card title="侦查员报告" icon={CheckCircle}>
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded">
                   <span className="text-sm text-slate-300 font-bold">🔋 能量补给</span>
                   <div className="flex gap-2">
                       <button onClick={() => updateReport('page3_fed', 'full')} className={`px-3 py-1 text-xs rounded border transition-colors ${userData.reports['page3_fed'] === 'full' ? 'bg-green-600 border-green-400 text-white' : 'border-slate-600 text-slate-500'}`}>已吃饱</button>
                       <button onClick={() => updateReport('page3_fed', 'need')} className={`px-3 py-1 text-xs rounded border transition-colors ${userData.reports['page3_fed'] === 'need' ? 'bg-red-600 border-red-400 text-white' : 'border-slate-600 text-slate-500'}`}>需充电</button>
                   </div>
                </div>
                <InputField 
                    label="今日发现最多的是..." 
                    placeholder="在此输入一个字"
                    value={userData.reports['page3_most'] || ''}
                    onChange={(val) => updateReport('page3_most', val)}
                />
            </div>
        </Card>

        <ChallengeTimer duration={10} label="鹰眼锁定：身体保持不动，只转动眼球，在10秒内找出3个红色的东西！" />
        <Button onClick={handleNext} className="w-full mt-4">区域扫描完成</Button>
    </div>
  );

  const renderPage4 = () => (
    <div className="space-y-4">
        <MissionImage 
            src="/images/nanjing-tulou.png" 
            alt="Nanjing Tulou" 
            overlayText="第2站：南靖土楼 (堡垒防御)" 
        />

        <HeroMessage hero="艾克斯奥特曼" avatarColor="bg-orange-600" message="发现巨型环状防御工事（土楼）！地下有热能反应（温泉），是最好的回血点！" />

        <Card title="零件雷达" icon={Home}>
             <DynamicRadarList 
                pageKey="page4"
                defaultItems={[
                    {id: '木', label: '木', desc: '结构/楼梯'},
                    {id: '土', label: '土', desc: '防御/墙壁'},
                    {id: '氵', label: '氵', desc: '温泉/流体'}
                ]}
                userData={userData}
                setUserData={setUserData}
             />
        </Card>

        <Card title="防御塔分析" icon={Shield}>
             <div className="mb-4 text-center">
                 <label className="text-cyan-400 text-xs font-bold block mb-2 uppercase">Defensive Rating</label>
                 <div className="flex gap-2 justify-center">
                     {[1,2,3,4,5].map(star => (
                         <Star 
                            key={star} 
                            size={32} 
                            className={`cursor-pointer transition-all hover:scale-110 ${userData.reports['page4_stars'] >= star ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-slate-700'}`}
                            onClick={() => updateReport('page4_stars', star)}
                         />
                     ))}
                 </div>
             </div>
             <button 
                onClick={() => updateReport('page4_bath', !userData.reports['page4_bath'])}
                className={`w-full p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${userData.reports['page4_bath'] ? 'bg-cyan-900/30 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
             >
                <div className={`w-6 h-6 border rounded flex items-center justify-center ${userData.reports['page4_bath'] ? 'bg-cyan-500 border-cyan-500' : 'border-slate-500'}`}>
                    {userData.reports['page4_bath'] && <CheckCircle size={16} className="text-white" />}
                </div>
                <span className="font-bold">温泉回血完成</span>
             </button>
        </Card>

        <ChallengeTimer duration={40} label="蒸汽呼吸法：深吸气 3 秒（假装吸入能量），慢吐气 5 秒。重复 5 次！" />
        <Button onClick={handleNext} className="w-full mt-4">前往下一坐标</Button>
    </div>
  );

  const renderPage5 = () => (
    <div className="space-y-4">
        <MissionImage 
            src="/images/sanfang-qixiang.png" 
            alt="Historical Lanes" 
            overlayText="第3站：三坊七巷 (历史解密)" 
        />

        <HeroMessage hero="梦比优斯" avatarColor="bg-indigo-600" message="这里的墙壁和门牌上刻着千年前的密码。特工，这里需要细致的拆解！" />

        <Card title="古代密码拆解" icon={Swords}>
            <DynamicRadarList 
                pageKey="page5"
                defaultItems={[
                    {id: '亻', label: '亻', desc: '人类/英雄'},
                    {id: '讠', label: '讠', desc: '语言/信号'},
                    {id: '门', label: '门', desc: '通道/空间'}
                ]}
                userData={userData}
                setUserData={setUserData}
             />
        </Card>

        <Card title="搜集报告" icon={PenTool}>
            <p className="text-xs text-slate-400 mb-2 uppercase">Artifact Sketch</p>
            <textarea
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white h-24 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="我在墙上/地上发现了一个特别的图案，是..."
                value={userData.reports['page5_draw'] || ''}
                onChange={(e) => updateReport('page5_draw', e.target.value)}
            ></textarea>
            
            <div className="mt-4 p-3 bg-slate-800 rounded flex items-center justify-between border border-slate-700">
                <span className="text-white text-sm">吃了肉燕/鱼丸吗？</span>
                <div className="flex gap-2">
                     <button onClick={() => updateReport('page5_food', 'yes')} className={`px-3 py-1 rounded text-xs transition-colors ${userData.reports['page5_food'] === 'yes' ? 'bg-green-500 text-white shadow-lg' : 'bg-slate-700 text-slate-400'}`}>Yes</button>
                     <button onClick={() => updateReport('page5_food', 'no')} className={`px-3 py-1 rounded text-xs transition-colors ${userData.reports['page5_food'] === 'no' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-700 text-slate-400'}`}>No</button>
                </div>
            </div>
        </Card>

        <ChallengeTimer duration={5} label="石像定身术：模仿路边的一个雕像，单脚站立保持 5 秒钟不摇晃！" />
        <Button onClick={handleNext} className="w-full mt-4">解密完成</Button>
    </div>
  );

  const renderPage6 = () => (
    <div className="space-y-4">
        <MissionImage 
            src="/images/base-hotel.png" 
            alt="Xiamen Hotel" 
            overlayText="第4站：厦门宾馆 (建立基地)" 
        />

        <HeroMessage hero="特遣队集合" avatarColor="bg-blue-500" message="警报解除！今晚我们需要在基地休整。特工必须确认‘能量舱’的位置！" />

        <Card title="特别任务·基地代码" icon={Battery}>
            <div className="bg-slate-950/50 p-4 rounded-lg mb-6 border border-slate-700">
                <InputField 
                    label="我的能量舱位号 (房间号)" 
                    placeholder="[ _ _ _ ]"
                    value={userData.reports['page6_room'] || ''}
                    onChange={(val) => updateReport('page6_room', val)}
                />
            </div>
            
             <h3 className="text-cyan-300 font-bold text-sm mb-3 uppercase tracking-wider">安全扫描 Radar</h3>
             <DynamicRadarList 
                pageKey="page6"
                defaultItems={[
                    {id: '宀', label: '宀', desc: '护盾/屋顶'},
                    {id: '安全门', label: '门', desc: '闸门/安全'},
                    {id: 'Free', label: '★', desc: '自由搜集'}
                ]}
                userData={userData}
                setUserData={setUserData}
             />
        </Card>

        <Card title="基地评测" icon={Star}>
             <div className="flex gap-2 mb-6 justify-center">
                 {[1,2,3,4,5].map(star => (
                     <Star 
                        key={star} 
                        size={32} 
                        className={`cursor-pointer ${userData.reports['page6_stars'] >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                        onClick={() => updateReport('page6_stars', star)}
                     />
                 ))}
             </div>
             <div className="flex justify-around gap-4">
                 <button onClick={() => updateReport('page6_plan', 'early')} className={`flex-1 py-3 border rounded-xl transition-all ${userData.reports['page6_plan'] === 'early' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-slate-600 text-slate-500'}`}>
                    <div className="text-2xl mb-1">☀</div>
                    <div className="text-xs font-bold">早起作战</div>
                 </button>
                 <button onClick={() => updateReport('page6_plan', 'sleep')} className={`flex-1 py-3 border rounded-xl transition-all ${userData.reports['page6_plan'] === 'sleep' ? 'border-blue-400 bg-blue-400/10 text-blue-400' : 'border-slate-600 text-slate-500'}`}>
                    <div className="text-2xl mb-1">💤</div>
                    <div className="text-xs font-bold">睡个懒觉</div>
                 </button>
             </div>
        </Card>

        <ChallengeTimer duration={20} label="激光迷阵：想象走廊有红外线。用脚尖轻轻走路（猫步），无声走到房间！" />
        <Button onClick={handleNext} className="w-full mt-4">基地确认安全</Button>
    </div>
  );

  const renderPage7 = () => (
    <div className="space-y-4">
        <MissionImage 
            src="/images/botanical-garden.png" 
            alt="Botanical Garden" 
            overlayText="第5站：植物园 (自然探险)" 
        />

        <HeroMessage hero="银河奥特曼" avatarColor="bg-green-600" message="好强大的生命力！这里是巨大的‘绿色乐高工厂’。去采集自然的原始代码！" />

        <Card title="生态能量提取" icon={Trees}>
            <DynamicRadarList 
                pageKey="page7"
                defaultItems={[
                    {id: '艹', label: '艹', desc: '植物/花草'},
                    {id: '森', label: '木', desc: '骨架/树林'},
                    {id: '山', label: '山', desc: '地形/岩石'}
                ]}
                userData={userData}
                setUserData={setUserData}
             />
        </Card>

        <Card title="生物样本分析" icon={Activity}>
            <div className="mb-6">
                <p className="text-slate-300 mb-3 text-sm">我摸到了一片叶子，它的手感是：</p>
                <div className="flex gap-3">
                    <button onClick={() => updateReport('page7_leaf', 'smooth')} className={`flex-1 py-3 rounded-lg border transition-all ${userData.reports['page7_leaf'] === 'smooth' ? 'bg-green-600/50 border-green-400 text-white ring-2 ring-green-400/30' : 'border-slate-600 text-slate-500'}`}>滑滑的</button>
                    <button onClick={() => updateReport('page7_leaf', 'rough')} className={`flex-1 py-3 rounded-lg border transition-all ${userData.reports['page7_leaf'] === 'rough' ? 'bg-yellow-600/50 border-yellow-400 text-white ring-2 ring-yellow-400/30' : 'border-slate-600 text-slate-500'}`}>粗糙的</button>
                </div>
            </div>
            <InputField 
                label="我看到的仙人掌像..." 
                placeholder="例如：巨大的狼牙棒"
                value={userData.reports['page7_cactus'] || ''}
                onChange={(val) => updateReport('page7_cactus', val)}
            />
        </Card>

        <ChallengeTimer duration={30} label="大力士搬运：找个重物（水瓶），蹲下-站起 5 次，为腿部装甲充能！" />
        <Button onClick={handleNext} className="w-full mt-4">全任务完成！提交数据</Button>
    </div>
  );

  const renderEnding = () => (
    <div className="flex flex-col items-center justify-center space-y-6 animate-fadeIn pb-10">
         <div className="text-center mt-4">
             <div className="inline-block p-4 rounded-full bg-yellow-400/20 mb-4 shadow-[0_0_40px_rgba(250,204,21,0.5)]">
                 <Star size={64} className="text-yellow-400 fill-yellow-400 animate-spin-slow" />
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-2 italic">MISSION COMPLETE</h1>
             <p className="text-cyan-400 tracking-wider">任务完成确认书</p>
         </div>

         <Card className="w-full border-2 border-yellow-500 bg-slate-900 shadow-2xl">
             <div className="absolute top-4 right-4 text-yellow-500/20">
                <Shield size={120} />
             </div>

             <div className="relative z-10 text-center space-y-4 py-4">
                <p className="text-slate-300">
                    恭喜特工 <span className="text-yellow-400 font-bold text-xl border-b border-yellow-500">{userData.agentName}</span>
                </p>
                <p className="text-slate-300 leading-relaxed">
                    你成功修复了福建星系的汉字机甲<br/>
                    共搜集了 <span className="text-cyan-400 font-bold text-4xl mx-1">{collectedCount}</span> 个能量零件！
                </p>
                
                {/* Display a few collected characters */}
                {collectedCount > 0 && (
                  <div className="flex justify-center gap-2 flex-wrap my-4">
                    {Object.entries(userData.radarData).slice(0, 4).map(([key, src], idx) => (
                      src && <div key={idx} className="w-12 h-12 border border-slate-600 rounded bg-slate-800 p-1">
                        <img src={src} className="w-full h-full object-contain filter invert" alt={key} />
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-sm text-slate-400 italic">
                    “银河、梦比优斯和艾克斯对你的表现非常满意。”
                </p>
             </div>

             <div className="mt-8 border-t-2 border-slate-700/50 pt-6">
                 <p className="text-center text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-4">Official Certification</p>
                 <div className="flex justify-between items-end px-4">
                     <div className="text-center">
                        <div className="h-10 w-32 border-b border-slate-500 flex items-end justify-center pb-1">
                            <span className="font-handwriting text-slate-600 font-serif italic text-sm">Commander X</span>
                        </div>
                        <span className="text-[10px] text-slate-600">指挥官签字</span>
                     </div>
                     <div className="bg-yellow-500 text-slate-900 font-black px-3 py-1 rounded text-xs transform -rotate-6 shadow-lg">
                         王牌侦察兵
                     </div>
                 </div>
             </div>
         </Card>

         <div className="w-full bg-red-900/20 border border-red-500/30 p-4 rounded-xl flex gap-4 items-center">
             <div className="bg-red-500/20 p-3 rounded-full">
                <Volume2 size={24} className="text-red-400" />
             </div>
             <div>
                 <h3 className="text-red-400 font-bold text-sm mb-1">春节特别任务 · 隐藏彩蛋</h3>
                 <p className="text-xs text-red-200/80 leading-relaxed">
                     既然在厦门过年，现在开启隐藏任务：搜集“红包”能量！只要对长辈说出吉祥话（机甲密令），就能获得补给！
                 </p>
             </div>
         </div>

         <div className="flex gap-4 w-full">
             <Button onClick={() => window.print()} variant="secondary" className="flex-1">保存/打印</Button>
             <Button onClick={() => setPage(0)} className="flex-1">再次行动</Button>
         </div>
    </div>
  );

  const renderContent = () => {
    switch(page) {
        case 0: return renderCover();
        case 1: return renderPage1();
        case 2: return renderPage2();
        case 3: return renderPage3();
        case 4: return renderPage4();
        case 5: return renderPage5();
        case 6: return renderPage6();
        case 7: return renderPage7();
        case 8: return renderEnding();
        default: return renderCover();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-white pb-24 md:pb-0">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-b border-cyan-900/50 z-50 flex items-center justify-between px-4 md:px-6 shadow-xl">
        <div className="flex items-center gap-3 text-cyan-400 font-bold">
           <div className="relative">
              <Activity size={20} className="text-cyan-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
           </div>
           <span className="text-sm tracking-wider uppercase hidden md:inline-block">Z-Unit Terminal</span>
           <span className="text-sm tracking-wider md:hidden">Z-Unit</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-cyan-600/70 border border-cyan-900/50 px-2 py-1 rounded hidden md:block">
                SYS.V.2.0.4
            </div>
            <div className="text-xs text-slate-400 font-mono">
                {userData.agentName ? `AGENT: ${userData.agentName}` : 'UNAUTHORIZED'}
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-24 pb-28 px-4 max-w-xl mx-auto min-h-screen flex flex-col">
        {renderContent()}
      </main>

      {/* Bottom Nav */}
      {page > 0 && page < 8 && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-cyan-900/50 p-4 z-50 pb-safe">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-6">
            <button 
                onClick={handlePrev}
                className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95 border border-slate-700"
            >
                <ChevronLeft size={24} />
            </button>
            
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider text-cyan-500 font-bold">
                    <span>Energy Progress</span>
                    <span>{(page / 8 * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white transition-all duration-700 ease-out shadow-[0_0_10px_#22d3ee]"
                        style={{ width: `${(page / 8 * 100)}%` }}
                    ></div>
                </div>
            </div>

            <button 
                onClick={handleNext}
                className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-95 border border-cyan-400"
            >
                <ChevronRight size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
