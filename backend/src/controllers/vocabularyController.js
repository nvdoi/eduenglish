import Vocabulary from '../models/Vocabulary.js';

// Get all vocabularies (with optional filters)
export const getAllVocabularies = async (req, res) => {
  try {
    const { search, partOfSpeech, favourite, userId } = req.query;
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { word: { $regex: search, $options: 'i' } },
        { meaning: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (partOfSpeech && partOfSpeech !== '') {
      query.partOfSpeech = partOfSpeech;
    }
    
    if (favourite === 'true') {
      query.favourite = true;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    const vocabularies = await Vocabulary.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabularies
    });
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vocabularies',
      error: error.message
    });
  }
};

// Get vocabulary by ID
export const getVocabularyById = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Vocabulary not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    console.error('Error fetching vocabulary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vocabulary',
      error: error.message
    });
  }
};

// Create new vocabulary
export const createVocabulary = async (req, res) => {
  try {
    const { word, meaning, example, pronunciation, partOfSpeech, favourite, userId } = req.body;
    
    const vocabulary = await Vocabulary.create({
      word,
      meaning,
      example,
      pronunciation,
      partOfSpeech,
      favourite: favourite || false,
      userId: userId || req.user?._id
    });
    
    res.status(201).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    console.error('Error creating vocabulary:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating vocabulary',
      error: error.message
    });
  }
};

// Update vocabulary
export const updateVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Vocabulary not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    console.error('Error updating vocabulary:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating vocabulary',
      error: error.message
    });
  }
};

// Toggle favourite status
export const toggleFavourite = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Vocabulary not found'
      });
    }
    
    vocabulary.favourite = !vocabulary.favourite;
    
    // Set userId if not already set
    if (!vocabulary.userId && req.user) {
      vocabulary.userId = req.user._id;
    }
    
    await vocabulary.save();
    
    res.status(200).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    console.error('Error toggling favourite:', error);
    res.status(400).json({
      success: false,
      message: 'Error toggling favourite',
      error: error.message
    });
  }
};

// Delete vocabulary
export const deleteVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndDelete(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Vocabulary not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Vocabulary deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vocabulary:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vocabulary',
      error: error.message
    });
  }
};

// Get favourite vocabularies
export const getFavouriteVocabularies = async (req, res) => {
  try {
    const { search, partOfSpeech, userId } = req.query;
    
    const query = { favourite: true };
    
    if (search) {
      query.$or = [
        { word: { $regex: search, $options: 'i' } },
        { meaning: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (partOfSpeech && partOfSpeech !== '') {
      query.partOfSpeech = partOfSpeech;
    }
    
    if (userId) {
      query.userId = userId;
    } else if (req.user) {
      query.userId = req.user._id;
    }
    
    const vocabularies = await Vocabulary.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabularies
    });
  } catch (error) {
    console.error('Error fetching favourite vocabularies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favourite vocabularies',
      error: error.message
    });
  }
};
