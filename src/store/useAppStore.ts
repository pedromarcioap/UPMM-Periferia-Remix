import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  vibePoints: number;
  responsaPoints: number;
  level: number;
  role: string;
}

export interface Photo {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  tags: string;
  vibeCount: number;
  commentCount: number;
  isGoldStandard: boolean;
  isSynced: boolean;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
    level: number;
  };
  _count?: {
    likes: number;
    comments: number;
    remixes: number;
  };
}

export interface Remix {
  id: string;
  title?: string;
  imageUrl: string;
  vibeCount: number;
  commentCount: number;
  createdAt: string;
  creator: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
    level: number;
  };
  originalPhoto: {
    id: string;
    title: string;
    author: {
      id: string;
      name?: string;
      username?: string;
    };
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    username?: string;
    avatar?: string;
    level: number;
  };
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  photos: Photo[];
  remixes: Remix[];
  currentPhoto: Photo | null;
  currentRemix: Remix | null;
  activeTab: "feed" | "upload" | "editor" | "profile" | "admin";
  feedFilter: "all" | "photos" | "remixes";
  sortBy: "recent" | "popular";
  selectedTag: string | null;
  editingPhoto: Photo | null;
  
  setUser: (user: User | null) => void;
  setPhotos: (photos: Photo[]) => void;
  addPhoto: (photo: Photo) => void;
  setRemixes: (remixes: Remix[]) => void;
  addRemix: (remix: Remix) => void;
  setCurrentPhoto: (photo: Photo | null) => void;
  setCurrentRemix: (remix: Remix | null) => void;
  setActiveTab: (tab: AppState["activeTab"]) => void;
  setFeedFilter: (filter: AppState["feedFilter"]) => void;
  setSortBy: (sort: AppState["sortBy"]) => void;
  setSelectedTag: (tag: string | null) => void;
  setEditingPhoto: (photo: Photo | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  photos: [],
  remixes: [],
  currentPhoto: null,
  currentRemix: null,
  activeTab: "feed",
  feedFilter: "all",
  sortBy: "recent",
  selectedTag: null,
  editingPhoto: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPhotos: (photos) => set({ photos }),
  addPhoto: (photo) => set((state) => ({ photos: [photo, ...state.photos] })),
  setRemixes: (remixes) => set({ remixes }),
  addRemix: (remix) => set((state) => ({ remixes: [remix, ...state.remixes] })),
  setCurrentPhoto: (photo) => set({ currentPhoto: photo }),
  setCurrentRemix: (remix) => set({ currentRemix: remix }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFeedFilter: (filter) => set({ feedFilter: filter }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  setEditingPhoto: (photo) => set({ editingPhoto: photo }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

// Editor Store
interface EditorState {
  originalImage: string | null;
  editedImage: string | null;
  activeFilter: string | null;
  brightness: number;
  contrast: number;
  saturation: number;
  textElements: TextElement[];
  stickers: StickerElement[];
  isDirty: boolean;
  
  setOriginalImage: (image: string | null) => void;
  setEditedImage: (image: string | null) => void;
  setActiveFilter: (filter: string | null) => void;
  setBrightness: (value: number) => void;
  setContrast: (value: number) => void;
  setSaturation: (value: number) => void;
  addTextElement: (element: TextElement) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  removeTextElement: (id: string) => void;
  addSticker: (sticker: StickerElement) => void;
  updateSticker: (id: string, updates: Partial<StickerElement>) => void;
  removeSticker: (id: string) => void;
  resetEditor: () => void;
  markDirty: () => void;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  rotation: number;
}

export interface StickerElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

const defaultEditorState = {
  originalImage: null,
  editedImage: null,
  activeFilter: null,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  textElements: [],
  stickers: [],
  isDirty: false,
};

export const useEditorStore = create<EditorState>((set) => ({
  ...defaultEditorState,

  setOriginalImage: (image) => set({ originalImage: image }),
  setEditedImage: (image) => set({ editedImage: image }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setBrightness: (value) => set({ brightness: value }),
  setContrast: (value) => set({ contrast: value }),
  setSaturation: (value) => set({ saturation: value }),
  addTextElement: (element) => set((state) => ({
    textElements: [...state.textElements, element],
    isDirty: true,
  })),
  updateTextElement: (id, updates) => set((state) => ({
    textElements: state.textElements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    ),
    isDirty: true,
  })),
  removeTextElement: (id) => set((state) => ({
    textElements: state.textElements.filter((el) => el.id !== id),
    isDirty: true,
  })),
  addSticker: (sticker) => set((state) => ({
    stickers: [...state.stickers, sticker],
    isDirty: true,
  })),
  updateSticker: (id, updates) => set((state) => ({
    stickers: state.stickers.map((st) =>
      st.id === id ? { ...st, ...updates } : st
    ),
    isDirty: true,
  })),
  removeSticker: (id) => set((state) => ({
    stickers: state.stickers.filter((st) => st.id !== id),
    isDirty: true,
  })),
  resetEditor: () => set(defaultEditorState),
  markDirty: () => set({ isDirty: true }),
}));
