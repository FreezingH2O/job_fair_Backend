const { register, login, getMe, logout } = require('../controllers/auth');
const User = require('../models/User');

// Mock the User model and its methods
jest.mock('../models/User');

describe('Auth Controller', () => {
  let req;
  let res;
  let next;
  let mockUser;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.JWT_COOKIE_EXPIRE = '30';
    process.env.NODE_ENV = 'development';
    
    // Setup request and response objects
    req = {
      body: {
        name: 'Test User',
        tel: '1234567890',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      },
      user: { id: '5f7d1f4b9d3e2a1b8c7d6e5f' }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
    
    // Mock user data
    mockUser = {
      _id: '5f7d1f4b9d3e2a1b8c7d6e5f',
      name: 'Test User',
      tel: '1234567890',
      email: 'test@example.com',
      role: 'user',
      createdAt: new Date(),
      getSignedJwtToken: jest.fn().mockReturnValue('mockedtoken123'),
      matchPassword: jest.fn().mockResolvedValue(true)
    };

    // Mock console.log to prevent cluttering test output
    console.log = jest.fn();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      // Setup
      User.create.mockResolvedValue(mockUser);

      // Execute
      await register(req, res, next);

      // Assert
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        tel: '1234567890',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      });
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'mockedtoken123',
        expect.objectContaining({
          expires: expect.any(Date),
          httpOnly: true
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        id: mockUser._id,
        token: 'mockedtoken123',
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt
      });
    });

    it('should handle registration errors', async () => {
      // Setup
      const error = new Error('Validation error');
      User.create.mockRejectedValue(error);

      // Execute
      await register(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false });
      expect(console.log).toHaveBeenCalledWith(error.stack);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Execute
      await login(req, res, next);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(mockUser.getSignedJwtToken).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'mockedtoken123',
        expect.objectContaining({
          expires: expect.any(Date),
          httpOnly: true
        })
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        id: mockUser._id,
        token: 'mockedtoken123',
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt
      });
    });

    it('should return 400 if email and password are not provided', async () => {
      // Setup
      req.body = {};

      // Execute
      await login(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Please provide an email and password'
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 if user not found', async () => {
      // Setup
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Execute
      await login(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Invalid credentials'
      });
    });

    it('should return 400 if password does not match', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      mockUser.matchPassword.mockResolvedValue(false);
      
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Execute
      await login(req, res, next);

      // Assert
      expect(mockUser.matchPassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Invalid credentials'
      });
    });

    it('should handle login errors', async () => {
      // Setup
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      User.findOne.mockImplementation(() => {
        throw new Error('Database error');
      });

      // Execute
      await login(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        msg: 'Cannot convert email or password to string'
      });
    });
  });

  describe('getMe', () => {
    it('should return the current user', async () => {
      // Setup
      User.findById.mockResolvedValue(mockUser);

      // Execute
      await getMe(req, res, next);

      // Assert
      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });
  });

  describe('logout', () => {
    it('should logout the user and clear cookie', async () => {
      // Execute
      await logout(req, res, next);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'none',
        expect.objectContaining({
          expires: expect.any(Date),
          httpOnly: true
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });
  });

  describe('sendTokenResponse', () => {
    it('should set secure cookie in production environment', async () => {
      // Setup
      process.env.NODE_ENV = 'production';
      User.create.mockResolvedValue(mockUser);

      // Execute
      await register(req, res, next);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'token',
        'mockedtoken123',
        expect.objectContaining({
          secure: true
        })
      );
    });
  });
});
