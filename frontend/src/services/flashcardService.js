import axiosInstance from '../axiosConfig';

class FlashcardService {
  // Get all public flashcards with filters
  async getPublicFlashcards(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });

    const response = await axiosInstance.get(`/api/flashcards?${queryParams}`);
    return response.data;
  }

  // Get user's own flashcards
  async getMyFlashcards() {
    const response = await axiosInstance.get('/api/flashcards/my/cards');
    return response.data;
  }

  // Get single flashcard by ID
  async getFlashcard(id) {
    const response = await axiosInstance.get(`/api/flashcards/${id}`);
    return response.data;
  }

  // Create new flashcard
  async createFlashcard(flashcardData) {
    const response = await axiosInstance.post('/api/flashcards', flashcardData);
    return response.data;
  }

  // Update flashcard
  async updateFlashcard(id, flashcardData) {
    const response = await axiosInstance.put(`/api/flashcards/${id}`, flashcardData);
    return response.data;
  }

  // Delete flashcard
  async deleteFlashcard(id) {
    const response = await axiosInstance.delete(`/api/flashcards/${id}`);
    return response.data;
  }

  // Get flashcards by difficulty
  async getFlashcardsByDifficulty(difficulty) {
    const response = await axiosInstance.get(`/api/flashcards/difficulty/${difficulty}`);
    return response.data;
  }

  // Get flashcards by category
  async getFlashcardsByCategory(category) {
    const response = await axiosInstance.get(`/api/flashcards/category/${category}`);
    return response.data;
  }

  // Get random flashcards for study
  async getRandomFlashcards(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value);
      }
    });

    const response = await axiosInstance.get(`/api/flashcards/study/random?${queryParams}`);
    return response.data;
  }
}

export default new FlashcardService();