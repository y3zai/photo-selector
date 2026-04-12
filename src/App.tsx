import React, { useState, useEffect, useMemo } from 'react';
import { FolderOpen, Heart, ChevronLeft, ChevronRight, X, AlertCircle, ExternalLink } from 'lucide-react';

interface Photo {
  handle: any;
  name: string;
  url: string;
  isFavorite: boolean;
}

export default function App() {
  const [isSupported, setIsSupported] = useState(true);
  const [dirHandle, setDirHandle] = useState<any | null>(null);
  const [favHandle, setFavHandle] = useState<any | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [immersiveIndex, setImmersiveIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredPhotos = useMemo(() => {
    return photos.filter(p => filter === 'all' || p.isFavorite);
  }, [photos, filter]);

  useEffect(() => {
    if (immersiveIndex !== null && immersiveIndex >= filteredPhotos.length) {
      if (filteredPhotos.length === 0) {
        setImmersiveIndex(null);
      } else {
        setImmersiveIndex(filteredPhotos.length - 1);
      }
    }
  }, [filteredPhotos.length, immersiveIndex]);

  useEffect(() => {
    if (!('showDirectoryPicker' in window)) {
      setIsSupported(false);
    }
  }, []);

  // Keyboard navigation for immersive view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (immersiveIndex === null) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setImmersiveIndex(null);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setImmersiveIndex(prev => prev !== null && prev > 0 ? prev - 1 : prev);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setImmersiveIndex(prev => prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : prev);
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (filteredPhotos[immersiveIndex]) {
          toggleFav(filteredPhotos[immersiveIndex].name);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [immersiveIndex, filteredPhotos, favHandle, photos]);

  const handleSelectFolder = async () => {
    setErrorMsg(null);
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);
      setLoading(true);
      
      const favoritesDir = await handle.getDirectoryHandle('favorites', { create: true });
      setFavHandle(favoritesDir);

      const favNames = new Set<string>();
      for await (const [name, entry] of favoritesDir.entries()) {
        if (entry.kind === 'file') {
          favNames.add(name);
        }
      }

      const loadedPhotos: Photo[] = [];
      for await (const [name, entry] of handle.entries()) {
        if (entry.kind === 'file' && name.match(/\.(jpe?g|png|webp|gif)$/i)) {
          const file = await entry.getFile();
          const url = URL.createObjectURL(file);
          loadedPhotos.push({
            handle: entry,
            name,
            url,
            isFavorite: favNames.has(name)
          });
        }
      }
      
      setPhotos(loadedPhotos);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'SecurityError') {
        setErrorMsg('File System Access is blocked in this preview. Please open the app in a new tab (using the button in the top right of AI Studio) to use this feature.');
      } else if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Failed to open directory.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = async (photoName: string) => {
    if (!favHandle) return;
    const index = photos.findIndex(p => p.name === photoName);
    if (index === -1) return;
    const photo = photos[index];
    const newPhotos = [...photos];
    
    try {
      if (photo.isFavorite) {
        await favHandle.removeEntry(photo.name);
        newPhotos[index].isFavorite = false;
      } else {
        const file = await photo.handle.getFile();
        const newFileHandle = await favHandle.getFileHandle(photo.name, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        newPhotos[index].isFavorite = true;
      }
      setPhotos(newPhotos);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      alert("Failed to toggle favorite. Make sure you granted read/write permissions.");
    }
  };

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4 bg-neutral-900 p-8 rounded-2xl border border-neutral-800">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Browser Not Supported</h1>
          <p className="text-neutral-400">
            Your browser does not support the File System Access API required for this app. 
            Please try using a Chromium-based browser like Chrome or Edge on desktop.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Photo Selector</h1>
        </div>
        <button
          onClick={handleSelectFolder}
          className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-200 transition-colors"
        >
          <FolderOpen className="w-4 h-4" />
          {dirHandle ? 'Change Folder' : 'Select Folder'}
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Error accessing folder</p>
              <p className="text-sm opacity-80 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {!dirHandle && !loading && !errorMsg && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500 space-y-6">
            <div className="w-24 h-24 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800">
              <FolderOpen className="w-10 h-10 opacity-50" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-medium text-white">No folder selected</h2>
              <p className="max-w-sm text-neutral-400">
                Select a folder on your computer to view photos. Favorited photos will be copied to a "favorites" subfolder.
              </p>
            </div>
            <button
              onClick={handleSelectFolder}
              className="mt-4 flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              Select Folder
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-800 border-t-white"></div>
            <p className="text-neutral-400 animate-pulse">Loading photos...</p>
          </div>
        )}

        {dirHandle && !loading && photos.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-neutral-500 space-y-4">
            <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800">
              <AlertCircle className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg text-white">No photos found</p>
            <p className="text-sm text-neutral-400">This folder doesn't contain any supported images (JPG, PNG, WEBP, GIF).</p>
          </div>
        )}

        {photos.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-2 bg-neutral-900 w-fit p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All Photos
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  filter === 'favorites' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${filter === 'favorites' ? 'fill-red-500 text-red-500' : ''}`} />
                Favorites
              </button>
            </div>

            {filteredPhotos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-neutral-500 space-y-4">
                <div className="w-20 h-20 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800">
                  <Heart className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg text-white">No favorites yet</p>
                <p className="text-sm text-neutral-400">Click the heart icon on a photo to add it to favorites.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredPhotos.map((photo, idx) => (
                  <div 
                    key={photo.name} 
                    className="group relative aspect-square bg-neutral-900 rounded-xl overflow-hidden cursor-pointer ring-1 ring-white/5 hover:ring-white/20 transition-all"
                    onClick={() => setImmersiveIndex(idx)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFav(photo.name);
                      }}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/60 transition-all border border-white/10 hover:scale-110"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${photo.isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Immersive View */}
      {immersiveIndex !== null && filteredPhotos[immersiveIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col">
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <div className="text-white/70 font-mono text-sm bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 pointer-events-auto">
              {immersiveIndex + 1} <span className="opacity-50">/</span> {filteredPhotos.length}
            </div>
            <button 
              onClick={() => setImmersiveIndex(null)}
              className="p-3 text-white/70 hover:text-white bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-all border border-white/10 hover:scale-105 pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Image Area */}
          <div className="flex-1 w-full min-h-0 pt-24 pb-4 px-4 md:px-16 flex items-center justify-center relative">
            <img 
              src={filteredPhotos[immersiveIndex].url} 
              alt={filteredPhotos[immersiveIndex].name}
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
            />
            
            {/* Navigation Controls */}
            {immersiveIndex > 0 && (
              <button 
                onClick={() => setImmersiveIndex(immersiveIndex - 1)}
                className="absolute left-4 md:left-8 p-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all border border-white/10 hover:scale-110 z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {immersiveIndex < filteredPhotos.length - 1 && (
              <button 
                onClick={() => setImmersiveIndex(immersiveIndex + 1)}
                className="absolute right-4 md:right-8 p-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full transition-all border border-white/10 hover:scale-110 z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="w-full pb-8 pt-2 flex justify-center shrink-0 z-50">
            <div className="relative group flex flex-col items-center">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap border border-white/10">
                Press <kbd className="font-sans font-semibold bg-white/20 px-1.5 py-0.5 rounded mx-1">Space</kbd> to toggle
              </div>
              <button
                onClick={() => toggleFav(filteredPhotos[immersiveIndex].name)}
                className="p-5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-xl transition-all border border-white/10 hover:scale-110 shadow-2xl"
              >
                <Heart 
                  className={`w-8 h-8 transition-transform ${filteredPhotos[immersiveIndex].isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
