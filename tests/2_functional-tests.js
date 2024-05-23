const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue.',
        created_by: 'Alma',
        assigned_to: 'Self',
        status_text: 'In Progress'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'This is a test issue.');
        assert.equal(res.body.created_by, 'Alma');
        assert.equal(res.body.assigned_to, 'Self');
        assert.equal(res.body.status_text, 'In Progress');
        done();
      });
  });
  test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue.',
        created_by: 'Alma',
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'This is a test issue.');
        done();
      });
  });
  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .post('/api/issues/apitest')
      .send({
        created_by: 'Alma',
        assigned_to: 'Self',
        status_text: 'In Progress'
      })
      .end(function (err, res) {
        assert.equal(res.body.error, 'required field(s) missing', 'Error message should indicate missing required fields');
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest')
      .end(function(err, res) {
        assert.isArray(res.body);
        done();
      });
  });
  test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/issues/apitest?created_by=Alma')
      .end(function(err, res) {
        assert.isArray(res.body);
        assert.equal(res.body[0].created_by, 'Alma');
        done();
      });
  });
  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
    chai
    .request(server)
    .keepOpen()
    .get('/api/issues/apitest?created_by=Alma&open=true')
    .end(function(err, res) {
      assert.isArray(res.body);
      assert.equal(res.body[0].created_by, 'Alma');
      assert.equal(res.body[0].open, true);
      done();
    });
  });
  test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
    const id = '664e431d527cc64f061c3c8e';
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
          _id: id,
          issue_title: 'Beautiful title'
        })
      .end(function(err, res) {
        const { _id, result } = res.body;
        
        assert.equal(_id, id);
        assert.equal(
          result, 
          `successfully updated`
        );
        done();
      });
  });
  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
    const id = '664e431d527cc64f061c3c8e';
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
          _id: id,
          issue_title: 'Beautiful title',
          issue_text: 'Beautifully done test text'
        })
      .end(function(err, res) {
        const { _id, result } = res.body;

        assert.equal(_id, id);
        assert.equal(
          result, 
          `successfully updated`
        );
        done();
      });
  });
  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
    const id = '664e431d527cc64f061c3c8e';
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({
          issue_title: 'Beautiful title',
          issue_text: 'Beautifully done test text'
        })
      .end(function(err, res) {
        const { error } = res.body;
        assert.equal(
          error,
          'missing _id'
        );
        done();
      });
  });
  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
    const id = '664e431d527cc64f061c3c8e';
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ _id: id })
      .end(function(err, res) {
        const { _id } = res.body;
        assert.isObject(res.body);
        assert.equal(_id, id);
        done();
      });
  });
  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
    const id = '664e4455bc7986677130ac08';
    chai
      .request(server)
      .keepOpen()
      .put('/api/issues/apitest')
      .send({ 
        _id: id,
        issue_title: 'Title test',
        issue_text: 'Text test'
       })
      .end(function(err, res) {
        const { error, _id } = res.body;
        assert.equal(error, `could not update`);
        assert.equal(_id, id);
        done();
      });
  });
  test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
    const id = '664e4428b411da12a0dcc609'
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({ _id: id })
      .end(function(err, res) {
        const { _id, result } = res.body;
        assert.equal(
          result,
          `successfully deleted`
        );
        assert.equal(_id, id);
        done();
      });
  });
  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
    const id = '664e43ccb00cc7b653abf4d4'
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({ _id: id })
      .end(function(err, res) {
        const { _id, error } = res.body;
        assert.equal(
          error,
          `could not delete`
        );
        assert.equal(_id, id);
        done();
      });
  });
  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
    chai
      .request(server)
      .keepOpen()
      .delete('/api/issues/apitest')
      .send({})
      .end(function(err, res) {
        const { error } = res.body;
        assert.equal(
          error,
          'missing _id'
        );
        done();
      });
  });
});
