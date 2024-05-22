'use strict';
const { ObjectID } = require("mongodb")
const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema({
  project_name:{
    type: String
  },
  _id:{
    type: String
  },
  issue_title:{
    type: String
  },
  issue_text:{
    type: String
  },
  created_on:{
    type: Date
  },
  updated_on:{
    type: Date
  },
  created_by:{
    type: String
  },
  assigned_to:{
    type: String
  },
  open:{
    type: Boolean
  },
  status_text:{
    type: String
  }
})

//model for mongoose
let Issue = mongoose.model('Issue', issueSchema)

module.exports = function (app) {

  app.route('/api/issues/:project')

    //get array of project, with possible filters
    .get(async function (req, res){
      let project = req.params.project;
      try{
        let filter = req.query
        filter.project_name = project
        let array = await Issue.find(filter)
        return res.json(array)
      }
      catch(error){
        console.log(error)
        return res.status(500).json({ error: 'had error getting issuearray'})
      }
    })
    
    //posting new issue
    .post(async function (req, res){
      let project = req.params.project;
      try{
        if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
          return res.json({error: 'required field(s) missing'})
        }
        //create new issue
        let issue = new Issue({
          project_name: project,
          _id: new mongoose.Types.ObjectId(),
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_on: new Date(),
          updated_on: new Date(),
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to ? req.body.assigned_to : "",
          open: true,
          status_text: req.body.status_text ? req.body.status_text : ""
        })
        //save new issue to database
        const savedIssue = await issue.save()
        //respond with JSON
        return res.json({
          _id: savedIssue._id.toString(),
          issue_title: savedIssue.issue_title,
          issue_text: savedIssue.issue_text,
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on,
          created_by: savedIssue.created_by,
          assigned_to: savedIssue.assigned_to,
          open: savedIssue.open,
          status_text: savedIssue.status_text
        })
      }
      catch(error){
        console.log(error)
        return res.status(500).json({ error: 'had error creating issue'})
      }
    })
    //updating an issue
    .put(async function (req, res){
      let project = req.params.project;
      try{
        console.log('the hint' + req.body.issue_title, typeof(req.body.issue_title), req.body.issue_text, typeof(req.body.issue_text), req.body.created_by, typeof(req.body.created_by), req.body.assigned_to, typeof(req.body.assigned_to), req.body.status_text, typeof(req.body.status_text))
        let status = req.body.open == 'true' ? false : true;
        /* if _id isn't filled out */
        if(req.body._id == null){
          return res.json({ error: 'missing _id'})
        }
        let id = await Issue.findById(req.body._id)
        
        //if update fields are empty
        if(req.body.issue_title == undefined && req.body.issue_text == undefined && req.body.created_by == undefined && req.body.assigned_to == undefined && req.body.status_text == undefined){
          console.log(req.body)
          return res.json({ 
            error: 'no update field(s) sent',
            _id: req.body._id 
          })
        }

        //if no valid id
        if (id == null){
          console.log(req.body)
          
          return res.json({
            error: 'could not update',
            _id: req.body._id
          })
        }
        


        //actually updating issue
            let changeTitle = await Issue.findByIdAndUpdate(id._id, { issue_title: req.body.issue_title ? req.body.issue_title : id.issue_title})
            let changeText = await Issue.findByIdAndUpdate(id._id, { issue_text: req.body.issue_text ? req.body.issue_text : id.issue_text})
            let changeCreatedBy = await Issue.findByIdAndUpdate(id._id, { created_by: req.body.created_by ? req.body.created_by : id.created_by})
            let changeAssignedTo = await Issue.findByIdAndUpdate(id._id, { assigned_to: req.body.assigned_to ? req.body.assigned_to : id.assigned_to})
            let changeStatusText = await Issue.findByIdAndUpdate(id._id, { status_text: req.body.status_text ? req.body.status_text : id.status_text})
            let changeOpen = await Issue.findByIdAndUpdate(id._id, {open: status})
            let changeUpdateTime = await Issue.findByIdAndUpdate(id._id, {
              updated_on: new Date()})
            return res.json({ 
              result: 'successfully updated',
              _id: req.body._id 
            })
        
      }
      catch(error){
        console.log(error)
        console.log(req.body)
        return res.status(500).json({ error: 'could not update', _id: req.body._id})
      }
    })

    //deleting an issue
    .delete(async function (req, res){
      let project = req.params.project;
      try {
        if(req.body._id == null){
          return res.json({ error: 'missing _id'})
        }
        let id = await Issue.findById(req.body._id)

        if(id == null){
          return res.json({ error: 'could not delete', 
                   _id: req.body._id})
        }
        else {
          let deleteIssue = await Issue.findByIdAndDelete(id._id)
          return res.json({ 
            result: 'successfully deleted',
            _id: id._id 
          })
        }
        
      }
      catch(error){
        console.log(error)
        return res.status(500).json({ error: 'could not delete', _id: req.body._id })
      }
    });
    
};
