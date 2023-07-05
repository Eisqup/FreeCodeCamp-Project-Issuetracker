const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const expectedKeys = ['assigned_to', 'status_text', 'open', '_id',
    'issue_title', 'issue_text', 'created_by', 'created_on', 'updated_on'];

suite('Functional Tests', function() {
    test("1 .Create an issue with every field: POST request to /api/issues/{project}", (done) => {
        const issue = {
            assigned_to: 'Tim',
            status_text: 'QA',
            open: true,
            issue_title: 'Test1',
            issue_text: 'Hause',
            created_by: 'Eis',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                for (const [key, value] of Object.entries(issue)) {
                    assert.strictEqual(res.body[key], value, `Problems with ${key}:${value}`);
                }
                assert.hasAllKeys(res.body, expectedKeys, "Keys are missing");
                done();
            });
    });
    test("2. Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test2',
            issue_text: 'Hause',
            created_by: 'Eis',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {

                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                for (const [key, value] of Object.entries(issue)) {
                    assert.strictEqual(res.body[key], value, `Problems with ${key}:${value}`);
                }
                assert.hasAllKeys(res.body, expectedKeys, "Keys are missing");

                done();
            });
    });
    test("3. Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test3',
            issue_text: 'Hause',
        };
        const excpectReturn = { error: 'required field(s) missing' }

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {

                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                assert.deepStrictEqual(res.body, excpectReturn,
                    "Error: Create an issue with missing required fields")
                done();
            });
    });
    test("4. View issues on a project: GET request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test4',
            issue_text: 'Hause',
            created_by: 'Eis',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .get("/api/issues/test")
                    .end((err, res) => {
                        assert.isNull(err);
                        assert.strictEqual(res.status, 200);
                        assert.isArray(res.body, "Is not a Array");
                        assert.isNotEmpty(res.body, "Array should not be empty");
                    })
                done();
            });
    });
    test("5. View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test5',
            issue_text: 'Hause',
            created_by: 'Eis',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .get("/api/issues/test?issue_title=Test5")
                    .end((err, res) => {
                        assert.isNull(err);
                        assert.strictEqual(res.status, 200);

                        assert.isArray(res.body, "Response should be an array");
                        assert.isNotEmpty(res.body, "Array should not be empty");

                        for (const issueObj of res.body) {
                            assert.strictEqual(issueObj.issue_title, "Test5", "Get Project with one filter");
                        }
                    })
                done();
            });
    });
    test("6. View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test6',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .get("/api/issues/test?issue_title=Test6&created_by=Eistee")
                    .end((err, res) => {
                        assert.isNull(err);
                        assert.strictEqual(res.status, 200);

                        assert.isArray(res.body, "Response should be an array");
                        assert.isNotEmpty(res.body, "Array should not be empty");

                        for (const issueObj of res.body) {
                            assert.strictEqual(issueObj.issue_title, "Test6", "Get Project with filter issue_title");
                            assert.strictEqual(issueObj.created_by, "Eistee", "Get Project with filter created_by ");
                        }
                    })
                done();
            });
    });
    test("7. Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test7',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .put("/api/issues/test")
                    .send({ _id: res.body._id, created_by: "Tim" })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body, { "result": "successfully updated", "_id": res.body._id }
                            , "Update data didnt work");

                    })
                done();
            });
    });
    test("8. Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test8',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .put("/api/issues/test")
                    .send({ _id: res.body._id, created_by: "Tim", status_text: "QA", assigned_to: "tttt" })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body, { "result": "successfully updated", "_id": res.body._id }
                            , "Update multiple fields");

                    })
                done();
            });
    });
    test("9. Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test9',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .put("/api/issues/test")
                    .send({ created_by: "Tim", status_text: "QA", assigned_to: "tttt" })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body, { error: 'missing _id' }
                            , "Update data didnt work. missing id");

                    })
                done();
            });
    });
    test("10. Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test10',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .put("/api/issues/test")
                    .send({ _id: res.body._id })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body, { error: 'no update field(s) sent', '_id': res.body._id }
                            , "Update with noe field in");

                    })
                done();
            });
    });
    test("11. Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test11',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .put("/api/issues/test")
                    .send({ _id: 6666 })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body, { error: 'no update field(s) sent', _id: 6666 }, "Update with invalid id");

                    })
                done();
            });
    });
    test("12. Delete an issue: DELETE request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test12',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .delete("/api/issues/test")
                    .send({ _id: res.body._id })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body,
                            { result: 'successfully deleted', '_id': res.body._id },
                            "delete a issue");

                    })
                done();
            });
    });
    test("13. Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test13',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                const wrongId = 6666

                chai.request(server)
                    .delete("/api/issues/test")
                    .send({ _id: wrongId })
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body,
                            { error: 'could not delete', '_id': wrongId },
                            "delete with invalid id");

                    })
                done();
            });
    });
    test("14. Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
        const issue = {
            issue_title: 'Test14',
            issue_text: 'Hause',
            created_by: 'Eistee',
        };

        chai.request(server)
            .post("/api/issues/test")
            .send(issue)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.status, 200);

                chai.request(server)
                    .delete("/api/issues/test")
                    .send({})
                    .end((err, response) => {
                        assert.isNull(err);
                        assert.strictEqual(response.status, 200);

                        assert.deepStrictEqual(response.body,
                            { error: 'missing _id' },
                            "delete with missing id");

                    })
                done();
            });
    });
    
    after(function() {
        chai.request(server)
            .get('/')
    });
});
