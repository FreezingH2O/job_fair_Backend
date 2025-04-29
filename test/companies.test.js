const mongoose = require('mongoose');
const { 
  getCompanies, 
  getCompany, 
  createCompany, 
  updateCompany, 
  deleteCompany,
  getAllTags 
} = require('../controllers/companies');
const Company = require('../models/Company');
const Interview = require('../models/Interview');
const Position = require('../models/Position');

// Mock the models
jest.mock('../models/Company');
jest.mock('../models/Interview');
jest.mock('../models/Position');

describe('Company Controller', () => {
  let req;
  let res;
  let next;
  let mockCompany;
  let mockCompanies;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request and response objects
    req = {
      params: { id: '5f7d1f4b9d3e2a1b8c7d6e5f' },
      query: {},
      body: {
        name: 'Test Company',
        website: 'https://testcompany.com',
        tags: ['Tech', 'Startup']
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
    
    // Mock data
    mockCompany = {
      _id: '5f7d1f4b9d3e2a1b8c7d6e5f',
      name: 'Test Company',
      website: 'https://testcompany.com',
      tags: ['Tech', 'Startup'],
      deleteOne: jest.fn().mockResolvedValue(true)
    };
    
    mockCompanies = [
      { ...mockCompany },
      {
        _id: '6f7d1f4b9d3e2a1b8c7d6e5f',
        name: 'Another Company',
        website: 'https://anothercompany.com',
        tags: ['Finance', 'Enterprise']
      }
    ];

    // Mock console.log and console.error
    console.log = jest.fn();
    console.error = jest.fn();
  });

  describe('getCompanies', () => {
    it('should get all companies with default pagination', async () => {
      // Setup
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCompanies)
      };
      
      Company.find.mockReturnValue(mockQuery);
      Company.countDocuments.mockResolvedValue(2);

      // Execute
      await getCompanies(req, res, next);

      // Assert
      expect(Company.find).toHaveBeenCalledWith({});
      expect(mockQuery.populate).toHaveBeenCalledWith('interviews');
      expect(mockQuery.sort).toHaveBeenCalledWith('name');
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(1000);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockCompanies
      });
    });

    it('should handle query parameters correctly', async () => {
      // Setup
      req.query = {
        select: 'name,website',
        sort: 'name',
        page: '2',
        limit: '10',
        location: 'New York',
        size: 'gt:100'
      };
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCompanies)
      };
      
      Company.find.mockReturnValue(mockQuery);
      Company.countDocuments.mockResolvedValue(25);

      // Execute
      await getCompanies(req, res, next);

      // Assert
      expect(Company.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith('name website');
      expect(mockQuery.sort).toHaveBeenCalledWith('name');
      expect(mockQuery.skip).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockCompanies
      });
    });

    it('should handle advanced filtering with gt, lt operators', async () => {
      // Setup
      req.query = {
        employees: 'gt:100',
        revenue: 'lt:1000000'
      };
      
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockCompanies)
      };
      
      Company.find.mockReturnValue(mockQuery);
      Company.countDocuments.mockResolvedValue(2);

      // Execute
      await getCompanies(req, res, next);

      // Assert
      expect(console.log).toHaveBeenCalledWith({ 
        employees: 'gt:100', 
        revenue: 'lt:1000000' 
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      // Setup
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      
      Company.find.mockReturnValue(mockQuery);
      Company.countDocuments.mockResolvedValue(2);

      // Execute
      await getCompanies(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });
  });

  describe('getCompany', () => {
    it('should get a single company by ID', async () => {
      // Setup
      Company.findById.mockResolvedValue(mockCompany);

      // Execute
      await getCompany(req, res, next);

      // Assert
      expect(Company.findById).toHaveBeenCalledWith(req.params.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCompany
      });
    });

    it('should return 400 if company not found', async () => {
      // Setup
      Company.findById.mockResolvedValue(null);

      // Execute
      await getCompany(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });

    it('should handle errors', async () => {
      // Setup
      Company.findById.mockRejectedValue(new Error('Database error'));

      // Execute
      await getCompany(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });
  });

  describe('createCompany', () => {
    it('should create a new company', async () => {
      // Setup
      Company.create.mockResolvedValue(mockCompany);

      // Execute
      await createCompany(req, res, next);

      // Assert
      expect(Company.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCompany
      });
    });

    it('should handle errors', async () => {
      // Setup
      const error = new Error('Validation error');
      Company.create.mockRejectedValue(error);

      // Execute
      await createCompany(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error creating company:', error.message);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Server Error',
        message: error.message
      });
    });
  });

  describe('updateCompany', () => {
    it('should update a company', async () => {
      // Setup
      Company.findByIdAndUpdate.mockResolvedValue(mockCompany);

      // Execute
      await updateCompany(req, res, next);

      // Assert
      expect(Company.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCompany
      });
    });

    it('should return 400 if company not found', async () => {
      // Setup
      Company.findByIdAndUpdate.mockResolvedValue(null);

      // Execute
      await updateCompany(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });

    it('should handle errors', async () => {
      // Setup
      Company.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

      // Execute
      await updateCompany(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });
  });

  describe('deleteCompany', () => {
    it('should delete a company and related positions when no interviews exist', async () => {
      // Setup
      Company.findById.mockResolvedValue(mockCompany);
      Interview.findOne.mockResolvedValue(null);
      Position.deleteMany.mockResolvedValue({ deletedCount: 3 });

      // Execute
      await deleteCompany(req, res, next);

      // Assert
      expect(Company.findById).toHaveBeenCalledWith(req.params.id);
      expect(Interview.findOne).toHaveBeenCalledWith({ company: req.params.id });
      expect(Position.deleteMany).toHaveBeenCalledWith({ company: req.params.id });
      expect(mockCompany.deleteOne).toHaveBeenCalledWith({ _id: req.params.id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });

    it('should return 400 if company not found', async () => {
      // Setup
      Company.findById.mockResolvedValue(null);

      // Execute
      await deleteCompany(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: `Company not found with id of ${req.params.id}`
      });
    });

    it('should return 400 if interviews exist for the company', async () => {
      // Setup
      Company.findById.mockResolvedValue(mockCompany);
      Interview.findOne.mockResolvedValue({ _id: 'interview1' });

      // Execute
      await deleteCompany(req, res, next);

      // Assert
      expect(Company.findById).toHaveBeenCalledWith(req.params.id);
      expect(Interview.findOne).toHaveBeenCalledWith({ company: req.params.id });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: `Cannot delete company. There are active interviews associated with this company.`
      });
      expect(Position.deleteMany).not.toHaveBeenCalled();
      expect(mockCompany.deleteOne).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Setup
      Company.findById.mockRejectedValue(new Error('Database error'));

      // Execute
      await deleteCompany(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
    });
  });

  describe('getAllTags', () => {
    it('should get all unique tags', async () => {
      // Setup
      const mockAggregateResult = [
        {
          tags: ['Tech', 'Startup', 'Finance', 'Enterprise']
        }
      ];
      
      Company.aggregate.mockResolvedValue(mockAggregateResult);

      // Execute
      await getAllTags(req, res, next);

      // Assert
      expect(Company.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 4,
        data: ['Enterprise', 'Finance', 'Startup', 'Tech'] // Alphabetical order
      });
    });

    it('should return empty array if no tags found', async () => {
      // Setup
      Company.aggregate.mockResolvedValue([]);

      // Execute
      await getAllTags(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should handle errors', async () => {
      // Setup
      const error = new Error('Database error');
      Company.aggregate.mockRejectedValue(error);

      // Execute
      await getAllTags(req, res, next);

      // Assert
      expect(console.error).toHaveBeenCalledWith(error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to fetch tags'
      });
    });
  });
});
