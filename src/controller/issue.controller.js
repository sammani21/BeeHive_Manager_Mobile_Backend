const {Request, Response} = require("express");
const {StandardResponse} = require("../dto/StandardResponse");
const {Issue} = require("../types/SchemaTypes");
const IssueModel = require('../model/issue.model');

const handleRerouting = (issue) => {
  console.log('Handling rerouting for issue:', issue);
  console.log('Rerouting to Vehicle No:', issue.reroutingNewVehicleNo);
  console.log('Rerouting to Driver No:', issue.reroutingNewDriverNo);

  // Add your rerouting logic here
  // For example, you might want to notify the new driver or update a different database collection

  // Simulate rerouting processing
  setTimeout(() => {
    console.log('Rerouting completed for issue:', issue);
  }, 2000);
};

exports.createIssue = async (req, res) => {
  try {
    const { incidentType, type, description, rerouting, reroutingNewVehicleNo, reroutingNewDriverNo } = req.body;

    // If rerouting is true, handle rerouting and do not save the issue in the database
    if (rerouting) {
      const reroutingIssue = {
        incidentType,
        type,
        description,
        rerouting,
        reroutingNewVehicleNo,
        reroutingNewDriverNo,
      };
      handleRerouting(reroutingIssue);
      return res.status(200).json({ message: 'Rerouting handled successfully', issue: reroutingIssue });
    }

    // If rerouting is false, save the issue in the database
    const newIssue = new IssueModel({
      incidentType,
      type,
      description,
      rerouting,
      reroutingNewVehicleNo: null,
      reroutingNewDriverNo: null,
    });

    await newIssue.save();

    res.status(201).json({ message: 'Issue created successfully', issue: newIssue });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create issue', error: error.message });
  }
};
