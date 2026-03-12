import { create } from 'zustand';

const useBooksStore = create((set) => ({
  books: [],
  currentBook: null,
  favorites: [],
  isLoading: false,
  error: null,

  // تعيين الكتب
  setBooks: (books) => set({ books, error: null }),

  // تعيين الكتاب الحالي
  setCurrentBook: (book) => set({ currentBook: book }),

  // تعيين المفضلة
  setFavorites: (favorites) => set({ favorites }),

  // إضافة كتاب للمفضلة
  addFavorite: (bookId) => set((state) => ({
    favorites: [...state.favorites, bookId],
  })),

  // حذف من المفضلة
  removeFavorite: (bookId) => set((state) => ({
    favorites: state.favorites.filter((id) => id !== bookId),
  })),

  // تعيين الأخطاء
  setError: (error) => set({ error }),

  // تعيين حالة التحميل
  setLoading: (isLoading) => set({ isLoading }),

  // مسح البيانات
  reset: () => set({
    books: [],
    currentBook: null,
    favorites: [],
    isLoading: false,
    error: null,
  }),
}));

export default useBooksStore;
