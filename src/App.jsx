import React, { useState, useEffect } from 'react';
import { Search, Clock, ChefHat, Star, Share2, Heart, Filter, Home, BookOpen } from 'lucide-react';

// API Service
const API_BASE = 'https://dummyjson.com/recipes';

const api = {
  getAllRecipes: async () => {
    const response = await fetch(`${API_BASE}?limit=50`);
    return response.json();
  },
  getRecipeById: async (id) => {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },
  searchRecipes: async (query) => {
    const response = await fetch(`${API_BASE}/search?q=${query}`);
    return response.json();
  }
};

// Utility Functions
const formatTime = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getDifficultyColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'hard': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Loading Component
const Loading = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
  </div>
);

// Empty State Component
const EmptyState = ({ message, icon: Icon = BookOpen }) => (
  <div className="text-center py-12">
    <Icon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
    <p className="text-gray-600 text-lg">{message}</p>
  </div>
);

// Error Component
const ErrorState = ({ message }) => (
  <div className="text-center py-12">
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
      <p className="text-red-600">{message}</p>
    </div>
  </div>
);

// Recipe Card Component
const RecipeCard = ({ recipe, onClick }) => (
  <div 
    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    onClick={() => onClick(recipe)}
  >
    <div className="aspect-video overflow-hidden">
      <img 
        src={recipe.image} 
        alt={recipe.name}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recipe.name}</h3>
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
          {recipe.cuisine}
        </span>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{formatTime(recipe.cookTimeMinutes)}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
          {recipe.difficulty}
        </span>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm text-gray-600">{recipe.rating}</span>
        </div>
      </div>
    </div>
  </div>
);

// Recipe List Component
const RecipeList = ({ recipes, onRecipeClick, loading = false, error = null }) => {
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!recipes || recipes.length === 0) {
    return <EmptyState message="No recipes found. Try adjusting your search or filters." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard 
          key={recipe.id} 
          recipe={recipe} 
          onClick={onRecipeClick}
        />
      ))}
    </div>
  );
};

// Search Bar Component
const SearchBar = ({ value, onChange, onSearch, placeholder = "Search recipes..." }) => (
  <div className="relative">
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      placeholder={placeholder}
      className="w-full px-4 py-3 pl-12 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    />
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
    <button
      onClick={onSearch}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
    >
      <Search className="h-4 w-4" />
    </button>
  </div>
);

// Filter Panel Component
const FilterPanel = ({ filters, onChange, onReset }) => {
  const cuisines = ['Italian', 'Asian', 'American', 'Mexican', 'Mediterranean', 'Indian', 'Thai'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-orange-600 hover:text-orange-700"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine</label>
          <select
            value={filters.cuisine}
            onChange={(e) => onChange({ ...filters, cuisine: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Cuisines</option>
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={filters.difficulty}
            onChange={(e) => onChange({ ...filters, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Levels</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Cook Time</label>
          <select
            value={filters.maxTime}
            onChange={(e) => onChange({ ...filters, maxTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Any Time</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navbar = ({ currentPage, onNavigate, onSearch, searchQuery, setSearchQuery }) => (
  <nav className="bg-white shadow-md sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <ChefHat className="h-8 w-8 text-orange-500" />
          <span className="ml-2 text-xl font-bold text-gray-900">RecipeHub</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'home' 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={() => onNavigate('search')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'search' 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="h-4 w-4" />
            Search
          </button>
          <button
            onClick={() => onNavigate('categories')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 'categories' 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Categories
          </button>
        </div>

        <div className="flex-1 max-w-lg mx-8">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={onSearch}
            placeholder="Search recipes..."
          />
        </div>
      </div>
    </div>
  </nav>
);

// Recipe Detail Component
const RecipeDetail = ({ recipe, onBack }) => (
  <div className="max-w-4xl mx-auto">
    <button
      onClick={onBack}
      className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
    >
      ← Back to recipes
    </button>
    
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="aspect-video md:aspect-[2/1] overflow-hidden">
        <img 
          src={recipe.image} 
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                {recipe.cuisine}
              </span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(recipe.cookTimeMinutes)}</span>
              </div>
              <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors min-h-[44px]">
              <Heart className="h-5 w-5" />
              Favorite
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-colors min-h-[44px]">
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-2">•</span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
            
            {recipe.nutrition && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrition (per serving)</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calories</span>
                    <span className="font-medium">{recipe.caloriesPerServing}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servings</span>
                    <span className="font-medium">{recipe.servings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prep Time</span>
                    <span className="font-medium">{formatTime(recipe.prepTimeMinutes)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Home Page Component
const HomePage = ({ recipes, loading, error, onRecipeClick }) => (
  <div>
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 mb-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Amazing Recipes</h1>
        <p className="text-xl md:text-2xl opacity-90">Find your next favorite meal from our collection of delicious recipes</p>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Recipes</h2>
      <RecipeList 
        recipes={recipes} 
        onRecipeClick={onRecipeClick}
        loading={loading}
        error={error}
      />
    </div>
  </div>
);

// Search Page Component
const SearchPage = ({ recipes, loading, error, onRecipeClick, searchQuery, onSearchChange, onSearch, filters, onFiltersChange, onFiltersReset }) => (
  <div className="max-w-7xl mx-auto px-4">
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Recipes</h1>
    
    <div className="mb-8">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        onSearch={onSearch}
        placeholder="Search for recipes, ingredients, or cuisine..."
      />
    </div>
    
    <div className="mb-8">
      <FilterPanel
        filters={filters}
        onChange={onFiltersChange}
        onReset={onFiltersReset}
      />
    </div>
    
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {searchQuery ? `Results for "${searchQuery}"` : 'All Recipes'}
      </h2>
      <RecipeList 
        recipes={recipes} 
        onRecipeClick={onRecipeClick}
        loading={loading}
        error={error}
      />
    </div>
  </div>
);

// Categories Page Component
const CategoriesPage = ({ onCategoryClick }) => {
  const categories = [
    { name: 'Italian', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', color: 'from-red-500 to-orange-500' },
    { name: 'Asian', image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400', color: 'from-yellow-500 to-red-500' },
    { name: 'American', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400', color: 'from-blue-500 to-red-500' },
    { name: 'Mexican', image: 'https://images.unsplash.com/photo-1565299585323-38174c8e3a7b?w=400', color: 'from-green-500 to-red-500' },
    { name: 'Mediterranean', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', color: 'from-blue-500 to-green-500' },
    { name: 'Indian', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', color: 'from-orange-500 to-yellow-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse by Category</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            onClick={() => onCategoryClick(category.name)}
            className="relative overflow-hidden rounded-xl cursor-pointer group hover:scale-105 transition-transform"
          >
            <div className="aspect-video">
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70 group-hover:opacity-80 transition-opacity`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-white text-2xl font-bold">{category.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [allRecipes, setAllRecipes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: '',
    difficulty: '',
    maxTime: ''
  });

  // Load initial recipes
  useEffect(() => {
    loadRecipes();
  }, []);

  // Filter recipes when filters, search results, or search query changes
  useEffect(() => {
    filterRecipes();
  }, [allRecipes, searchResults, searchQuery, filters, isSearching]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllRecipes();
      setAllRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error loading recipes:', err);
      setError('Failed to load recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    // Use search results if we're searching, otherwise use all recipes
    let recipesToFilter = isSearching ? searchResults : allRecipes;
    let filtered = [...recipesToFilter];

    // If not using API search, apply local search filter
    if (!isSearching && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.cuisine.toLowerCase().includes(query) ||
        (recipe.ingredients && recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        ))
      );
    }

    // Cuisine filter
    if (filters.cuisine) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine.toLowerCase() === filters.cuisine.toLowerCase()
      );
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(recipe => 
        recipe.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }

    // Max time filter
    if (filters.maxTime) {
      const maxTime = parseInt(filters.maxTime);
      filtered = filtered.filter(recipe => recipe.cookTimeMinutes <= maxTime);
    }

    setFilteredRecipes(filtered);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If empty search, reset to local filtering
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);
      
      const data = await api.searchRecipes(searchQuery);
      setSearchResults(data.recipes || []);
      setCurrentPage('search');
    } catch (err) {
      console.error('Error searching recipes:', err);
      // Fall back to local search if API search fails
      setIsSearching(false);
      setSearchResults([]);
      setError('API search failed, showing local results instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = async (recipe) => {
    try {
      setLoading(true);
      const fullRecipe = await api.getRecipeById(recipe.id);
      setSelectedRecipe(fullRecipe);
      setCurrentPage('detail');
    } catch (err) {
      setError('Failed to load recipe details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    setFilters({ ...filters, cuisine: categoryName });
    setCurrentPage('search');
  };

  const handleFiltersReset = () => {
    setFilters({ cuisine: '', difficulty: '', maxTime: '' });
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const displayRecipes = currentPage === 'search' ? filteredRecipes : (filteredRecipes.length > 0 ? filteredRecipes : allRecipes);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="py-8">
        {currentPage === 'home' && (
          <HomePage
            recipes={displayRecipes}
            loading={loading}
            error={error}
            onRecipeClick={handleRecipeClick}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage
            recipes={displayRecipes}
            loading={loading}
            error={error}
            onRecipeClick={handleRecipeClick}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearch={handleSearch}
            filters={filters}
            onFiltersChange={setFilters}
            onFiltersReset={handleFiltersReset}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage onCategoryClick={handleCategoryClick} />
        )}

        {currentPage === 'detail' && selectedRecipe && (
          <div className="max-w-7xl mx-auto px-4">
            <RecipeDetail
              recipe={selectedRecipe}
              onBack={() => setCurrentPage('home')}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;