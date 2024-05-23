'use strict';
const { ObjectID } = require('mongodb');
const mongoose     = require('mongoose');

const issueSchema = new mongoose.Schema({
  project_title: { type: String },
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  assigned_to: { type: String },
  status_text: { type: String },
  created_by: { type: String, required: true },
  created_on: { type: Date },
  updated_on: { type: Date },
  open: { type: Boolean }
});

let Issue = mongoose.model("User", issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res) {
      try {
        let project = req.params.project;
        let query = { ...req.query, project_title: project };

        let project_lists = await Issue.find(query);

        return res.json(project_lists);
      } catch (err) {
        console.log(err);
        return res.status(500).json({
            error: `Project ${project} not found in the database`
        });
      }
    })

    .post(async function (req, res){
      let project = req.params.project;
      try {
        const { 
          issue_title, 
          issue_text, 
          created_by, 
          assigned_to, 
          status_text 
        } = req.body;
        
        if (!issue_title
         || !issue_text
         || !created_by
        ) {
          return res.json({
            error: 'required field(s) missing'
          })
        };

        let issue = new Issue({
          project_title: project,
          issue_title: issue_title,
          issue_text: issue_text,
          assigned_to: assigned_to ? assigned_to : '',
          status_text: status_text ? status_text: '',
          created_by: created_by,
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        });

        const issueSaved = await issue.save();

        return res.json({
          _id: issueSaved._id.toString(),
          issue_title: issueSaved.issue_title,
          issue_text: issueSaved.issue_text,
          assigned_to: issueSaved.assigned_to,
          status_text: issueSaved.status_text,
          created_by: issueSaved.created_by,
          created_on: issueSaved.created_on,
          updated_on: issueSaved.updated_on,
          open: issueSaved.open
        });

      } catch(err) {
        console.log(err);
        return res.status(500).json({
          error: `Error creating issue at ${project}`
        });
      };
    })
    
    .put(async function (req, res){
      let project = req.params.project;
      try {
        const {
          _id, 
          issue_title, 
          issue_text, 
          created_by, 
          assigned_to, 
          status_text,
          open 
        } = req.body;
    
        if (!_id) {
          return res.json({ error: 'missing _id' });
        }
    
        if (issue_title == undefined && 
            issue_text == undefined && 
            created_by == undefined && 
            assigned_to == undefined && 
            status_text == undefined && 
            open == undefined) {
          return res.json({ 
            error: `no update field(s) sent`,
            _id: _id 
          });
        }
    
        const updateFields = {};
        if (issue_title !== undefined) updateFields.issue_title = issue_title;
        if (issue_text !== undefined) updateFields.issue_text = issue_text;
        if (created_by !== undefined) updateFields.created_by = created_by;
        if (assigned_to !== undefined) updateFields.assigned_to = assigned_to;
        if (status_text !== undefined) updateFields.status_text = status_text;
        
        // Handle the `open` field correctly
        if (open !== undefined) {
          updateFields.open = open === 'false' ? false : true;
        }
    
        updateFields.updated_on = new Date();
    
        const updatedIssue = await Issue.findByIdAndUpdate(_id, updateFields, { new: true });
    
        if (!updatedIssue) {
          return res.json({
            error: `could not update`,
            _id: _id
          });
        }
    
        return res.json({ 
          result: `successfully updated`,
          _id: _id 
        });
    
      } catch(err) {
        console.error(err);
        return res.status(500).json({
          error: `Can't update issue with id ${_id}`
        });
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      try {
        const { _id } = req.body;

        if(_id == null){
          return res.json({ 
            error: `missing _id`
          })
        }

        let id = await Issue.findById(_id);

        if(id == null){
          return res.json({ 
            error: `could not delete`, 
            _id: _id
          });
        } else {
          let deleteIssue = await Issue.findByIdAndDelete(id._id)
          return res.json({
            result: `successfully deleted`,
            _id: id._id
          })
        }
      }
      catch(err){
        console.log(err);
        return res.status(500).json({ 
          error: `could not delete`, 
          _id: _id
        })
      }
    });
};
