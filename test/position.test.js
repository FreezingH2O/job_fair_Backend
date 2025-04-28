const request = require('supertest');
const app = require('../server');
const Position = require('../models/Position');
const Company = require('../models/Company');

describe('Job Position Management', () => {
  
  let companyId;

  beforeAll(async () => {
    // Create a company for testing
    const company = await Company.create({
      name: 'Test Company',
      address: '123 Test St',
      website: 'https://www.testcompany.com',
      description: 'A company for testing purposes.',
      tel: '123456789',
      tags: ['Tech', 'Innovation'],
      logo: 'https://www.testcompany.com/logo.png',
      companySize: '51-200 employees',
      overview: 'Overview of Test Company',
      foundedYear: 2000
    });
    companyId = company._id;
  });

  afterAll(async () => {
    // Clean up the test data
    await Company.deleteMany({});
    await Position.deleteMany({});
  });

  test('Admin can create a new job position', async () => {
    const response = await request(app)
      .post(`/api/v1/companies/${companyId}/positions`)
      .send({
        title: 'Software Engineer',
        description: 'Develop software applications',
        responsibilities: ['Coding', 'Testing'],
        requirements: ['3+ years experience', 'JavaScript'],
        skill: ['JavaScript', 'Node.js'],
        openingPosition: 2,
        salary: {
          min: 60000,
          max: 80000
        },
        workArrangement: 'Remote',
        location: 'Remote',
        interviewStart: new Date(Date.now() + 86400000), // 1 day from now
        interviewEnd: new Date(Date.now() + 172800000) // 2 days from now
      });
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Software Engineer');
    expect(response.body.data.company.toString()).toBe(companyId.toString());
  });

  test('Admin can update an existing job position', async () => {
    const position = await Position.create({
      title: 'Software Engineer',
      description: 'Develop software applications',
      responsibilities: ['Coding', 'Testing'],
      requirements: ['3+ years experience', 'JavaScript'],
      skill: ['JavaScript', 'Node.js'],
      openingPosition: 2,
      salary: {
        min: 60000,
        max: 80000
      },
      workArrangement: 'Remote',
      location: 'Remote',
      company: companyId,
      interviewStart: new Date(Date.now() + 86400000), // 1 day from now
      interviewEnd: new Date(Date.now() + 172800000) // 2 days from now
    });

    const response = await request(app)
      .put(`/api/v1/positions/${position._id}`)
      .send({
        description: 'Develop and maintain software applications',
        responsibilities: ['Coding', 'Testing', 'Deployment'],
        requirements: ['5+ years experience', 'JavaScript', 'React'],
        salary: {
          min: 70000,
          max: 90000
        }
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.description).toBe('Develop and maintain software applications');
  });

  test('Admin can retrieve a list of all job positions', async () => {
    const response = await request(app).get('/api/v1/positions');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBeGreaterThan(0); // Ensure there are job positions available
  });

  test('Admin can delete a job position', async () => {
    const position = await Position.create({
      title: 'Software Engineer',
      description: 'Develop software applications',
      responsibilities: ['Coding', 'Testing'],
      requirements: ['3+ years experience', 'JavaScript'],
      skill: ['JavaScript', 'Node.js'],
      openingPosition: 2,
      salary: {
        min: 60000,
        max: 80000
      },
      workArrangement: 'Remote',
      location: 'Remote',
      company: companyId,
      interviewStart: new Date(Date.now() + 86400000), // 1 day from now
      interviewEnd: new Date(Date.now() + 172800000) // 2 days from now
    });

    const response = await request(app).delete(`/api/v1/positions/${position._id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual({});
  });

  test('Admin can get a single job position', async () => {
    const position = await Position.create({
      title: 'Software Engineer',
      description: 'Develop software applications',
      responsibilities: ['Coding', 'Testing'],
      requirements: ['3+ years experience', 'JavaScript'],
      skill: ['JavaScript', 'Node.js'],
      openingPosition: 2,
      salary: {
        min: 60000,
        max: 80000
      },
      workArrangement: 'Remote',
      location: 'Remote',
      company: companyId,
      interviewStart: new Date(Date.now() + 86400000), // 1 day from now
      interviewEnd: new Date(Date.now() + 172800000) // 2 days from now
    });

    const response = await request(app).get(`/api/v1/positions/${position._id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Software Engineer');
  });

  test('Admin cannot create a position for a non-existent company', async () => {
    const response = await request(app)
      .post('/api/v1/companies/invalidCompanyId/positions')
      .send({
        title: 'Software Engineer',
        description: 'Develop software applications',
        responsibilities: ['Coding', 'Testing'],
        requirements: ['3+ years experience', 'JavaScript'],
        skill: ['JavaScript', 'Node.js'],
        openingPosition: 2,
        salary: {
          min: 60000,
          max: 80000
        },
        workArrangement: 'Remote',
        location: 'Remote',
        interviewStart: new Date(Date.now() + 86400000), // 1 day from now
        interviewEnd: new Date(Date.now() + 172800000) // 2 days from now
      });
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('No company with the ID of');
  });

});
