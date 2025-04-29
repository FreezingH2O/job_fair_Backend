const request = require("supertest");
const app = require("../server");
const Position = require("../models/Position");
const Company = require("../models/Company");
const mongoose = require("mongoose");
const Interview = require("../models/Interview");

describe("Job Position Management", () => {
  let companyId;
  let positionId;
  let token;
  let interviewStartDate;

  beforeAll(async () => {
    // Create a company for testing
    const company = await Company.create({
      name: "Test Company",
      address: "123 Test St",
      website: "https://www.testcompany.com",
      description: "A company for testing purposes.",
      tel: "123456789",
      tags: ["Tech", "Innovation"],
      logo: "https://www.testcompany.com/logo.png",
      companySize: "51-200 employees",
      overview: "Overview of Test Company",
      foundedYear: 2000,
    });
    companyId = company._id;

    // console.log("Using companyId:", companyId);

    const user = await request(app)
      .post(`/api/v1/auth/login`)
      .set("Content-Type", "application/json")
      .send({
        email: "admin@gmail.com",
        password: "12345678",
      });

    token = user.body.token;
  }, 60000);

  afterAll(async () => {
    await Position.deleteMany({ company: companyId });
    await Company.findByIdAndDelete(companyId);
    await mongoose.connection.close(); // (optional) close connection if you want to avoid hanging tests
    jest.restoreAllMocks();
  });

  describe("Create Position", () => {
    //create position
    test("Admin can create a new job position", async () => {
      interviewStartDate = new Date(Date.now() + 86400000 * 4);

      const response = await request(app)
        .post(`/api/v1/company/${companyId}/positions`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Testing Position",
          description: "Develop software applications",
          responsibilities: ["Coding", "Testing"],
          requirements: ["3+ years experience", "JavaScript"],
          skill: ["JavaScript", "Node.js"],
          openingPosition: 2,
          salary: {
            min: 60000,
            max: 80000,
          },
          workArrangement: "Remote",
          location: "Remote",
          interviewStart: new Date(Date.now() + 86400000), // 1 day from now
          interviewEnd: new Date(Date.now() + 86400000 * 4), // 4 days from now
        });

      positionId = response.body.data._id;
      // console.log("position id is " + response.body.data._id);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Testing Position");
      expect(response.body.data.company.toString()).toBe(companyId.toString());
    }, 60000);

    //create position with non-existent company
    test("Admin cannot create a position for a non-existent company", async () => {
      const response = await request(app)
        .post("/api/v1/company/680f6f31fa61bf5837c9f69a/positions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Software Engineer",
          description: "Develop software applications",
          responsibilities: ["Coding", "Testing"],
          requirements: ["3+ years experience", "JavaScript"],
          skill: ["JavaScript", "Node.js"],
          openingPosition: 2,
          salary: {
            min: 60000,
            max: 80000,
          },
          workArrangement: "Remote",
          location: "Remote",
          interviewStart: new Date(Date.now() + 86400000), // 1 day from now
          interviewEnd: new Date(Date.now() + 172800000), // 2 days from now
        });

      console.log(response.body);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("No company with the ID of");
    }, 60000);

    //create position with invalid company id
    test("Admin cannot create a position for a invalid company id", async () => {
      const response = await request(app)
        .post("/api/v1/company/invalidCompanyId/positions")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Software Engineer",
          description: "Develop software applications",
          responsibilities: ["Coding", "Testing"],
          requirements: ["3+ years experience", "JavaScript"],
          skill: ["JavaScript", "Node.js"],
          openingPosition: 2,
          salary: {
            min: 60000,
            max: 80000,
          },
          workArrangement: "Remote",
          location: "Remote",
          interviewStart: new Date(Date.now() + 86400000), // 1 day from now
          interviewEnd: new Date(Date.now() + 172800000), // 2 days from now
        });

      console.log(response.body);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Cannot create position");
    }, 60000);
  });

  describe("Update Position", () => {
    //update position
    test("Admin can update an existing job position", async () => {
      const response = await request(app)
        .put(`/api/v1/positions/${positionId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Develop and maintain software applications",
          responsibilities: ["Coding", "Testing", "Deployment"],
          requirements: ["5+ years experience", "JavaScript", "React"],
          salary: {
            min: 70000,
            max: 90000,
          },
        });

      // console.log("position id is " + positionId);
      // console.log(response.body._id);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(
        "Develop and maintain software applications"
      );

      expect(response.body.data.responsibilities[0]).toBe("Coding");
      expect(response.body.data.responsibilities[1]).toBe("Testing");
      expect(response.body.data.responsibilities[2]).toBe("Deployment");

      expect(response.body.data.requirements[0]).toBe("5+ years experience");
      expect(response.body.data.requirements[1]).toBe("JavaScript");
      expect(response.body.data.requirements[2]).toBe("React");

      expect(response.body.data.salary.min).toBe(70000);
      expect(response.body.data.salary.max).toBe(90000);
    }, 60000);

    //update position with non-existent position
    test("Admin can't update an non-existing job position", async () => {
      const response = await request(app)
        .put(`/api/v1/positions/680f6dcfa6b532cb389230e7`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Develop and maintain software applications",
          responsibilities: ["Coding", "Testing", "Deployment"],
          requirements: ["5+ years experience", "JavaScript", "React"],
          salary: {
            min: 70000,
            max: 90000,
          },
        });

      // console.log("position id is " + positionId);
      // console.log(response.body._id);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "No position with the ID of 680f6dcfa6b532cb389230e7"
      );
    }, 60000);

    //update position with invalid position id
    test("Admin can't update an job position with invalid position id", async () => {
      const response = await request(app)
        .put(`/api/v1/positions/invalidPositionId`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Develop and maintain software applications",
          responsibilities: ["Coding", "Testing", "Deployment"],
          requirements: ["5+ years experience", "JavaScript", "React"],
          salary: {
            min: 70000,
            max: 90000,
          },
        });

      // console.log("position id is " + positionId);
      // console.log(response.body._id);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cannot update position");
    }, 60000);
  });

  describe("Get All Position", () => {
    //getAll position of specific company id
    test("Admin can retrieve a list of all job positions of specific company id", async () => {
      const response = await request(app).get(
        `/api/v1/company/${companyId}/positions`
      );
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0); // Ensure there are job positions available
    }, 60000);

    //getAll position 500 error
    test("should handle errors and return 500 when fail to fetch positions", async () => {
      jest.spyOn(Position, "find").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app).get("/api/v1/positions");
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cannot get positions"); // Ensure there are job positions available
    }, 60000);
  });

  describe("Get One Position", () => {
    //getOne position
    test("Admin can get a single job position", async () => {
      const response = await request(app).get(
        `/api/v1/positions/${positionId}`
      );
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Testing Position");
    }, 60000);

    //getOne position with non-existent company
    test("Admin can't get a single job position with non-existent company", async () => {
      const response = await request(app).get(
        `/api/v1/positions/680f6f31fa61bf5837c9f69a`
      );
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "No position with the ID of 680f6f31fa61bf5837c9f69a"
      );
    }, 60000);

    //getOne position with invalid company id
    test("Admin can't get a single job position with invalid company id", async () => {
      const response = await request(app).get(
        `/api/v1/positions/invalidCompanyId`
      );
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cannot get position");
    }, 60000);
  });

  describe("Get All Skill", () => {
    //getAll skill
    test("Admin can get all skills of a job position", async () => {
      const response = await request(app)
        .get(`/api/v1/positions/skills`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0); // Ensure there are job positions available
    }, 60000);

    //getAll skill fail 500 error
    test("should handle errors and return 500 when fail to fetch skills", async () => {
      jest.spyOn(Position, "aggregate").mockImplementation(() => {
        throw new Error("Database error");
      });

      const response = await request(app)
        .get(`/api/v1/positions/skills`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to fetch skill"); // Ensure there are job positions available
    }, 60000);
  });

  describe("Delete Position", () => {
    //delete position with non-existent position
    test("Admin can't delete a non-existent job position ", async () => {
      const response = await request(app)
        .delete(`/api/v1/positions/680f6dcfa6b856cb389230e7`)
        .set("Authorization", `Bearer ${token}`);

      // console.log("response is " + response.status);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "No position with the ID of 680f6dcfa6b856cb389230e7"
      );
    }, 60000);

    //delete position with invalid position id
    test("Admin can't delete a job position with invalid position id", async () => {
      const response = await request(app)
        .delete(`/api/v1/positions/invalidPositionId`)
        .set("Authorization", `Bearer ${token}`);

      // console.log("response is " + response.status);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Cannot delete position");
    }, 60000);

    //delete position with active interviews
    test("Admin can't delete a job position with active interviews", async () => {
      const interview = await request(app)
        .post(`/api/v1/companies/${companyId}/interviews/`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          position: positionId,
          interviewDate: new Date(interviewStartDate + 1000 * 60 * 60 * 9),
        });

      const response = await request(app)
        .delete(`/api/v1/positions/${positionId}`)
        .set("Authorization", `Bearer ${token}`);

      console.log("interview id is " + interview.body.data._id);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Cannot delete position. There are active interviews associated with this position."
      );

      const deleteInterview = await request(app)
        .delete(`/api/v1/interviews/${interview.body.data._id}`)
        .set("Authorization", `Bearer ${token}`);
    }, 60000);

    //delete position
    test("Admin can delete a job position", async () => {
      const response = await request(app)
        .delete(`/api/v1/positions/${positionId}`)
        .set("Authorization", `Bearer ${token}`);

      console.log("response is " + response.body.message);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({});
    }, 60000);
  });
});
