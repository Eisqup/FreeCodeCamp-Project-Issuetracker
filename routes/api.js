'use strict';

const mongoose = require('mongoose')
const IssueModel = require('../mongooDB/Model')

module.exports = function(app, myDB) {

    app.route('/api/issues/:project')

        .get(async function(req, res) {

            let project = req.params.project;
            req.query.project = project
            if (req.query.open) {
                req.query.open = req.query.open == "true" ? true : false
            }

            try {
                const result = await myDB.find({ $and: [req.query] }).toArray();

                res.send(result.map(r => {
                    delete r.project
                    return r
                }))

            } catch (e) {
                console.log(`Cant find query data: \n${e}`)
            }


        })

        .post(function(req, res) {
            let project = req.params.project;

            if (!req.body["created_by"] || !req.body["issue_title"] || !req.body["issue_text"]) {
                res.send({ error: 'required field(s) missing' })
                return
            }

            req.body.project = project
            const newIssue = new IssueModel(req.body);

            myDB.insertOne(newIssue)
                .then(response => {
                    myDB.findOne({ _id: response.insertedId })
                        .then(doc => {
                            delete doc.project
                            res.send(doc)
                        })
                })
                .catch(err => {
                    console.log(`Coudnt insert new Data:\n${err}\n`)
                    res.send("Coudnt insert new Data")
                })
        })

        .put(async function(req, res) {
            // let project = req.params.project;

            if (!req.body._id) {
                res.send({ error: 'missing _id' })
                return
            }
            if (!req.body.issue_title &&
                !req.body.issue_text &&
                !req.body.created_by &&
                !req.body.assigned_to &&
                !req.body.status_text &&
                !req.body.hasOwnProperty("open")
                //((!req.body.hasOwnProperty("open") && dataDB.open == true) ||     // To open cloesed Issu oder close opened Issus
                //    (req.body.hasOwnProperty("open") && dataDB.open == false))
            ) {
                res.send({ error: 'no update field(s) sent', '_id': req.body._id })
                return

            }

            myDB.findOne({ _id: req.body._id })
                .then(dataDB => {

                    if (!dataDB) {
                        res.send({ error: 'could not update', '_id': req.body._id })

                    } else {
                        const updatedDataForDB = {};
                        Object.keys(dataDB)
                            .forEach(key => {
                                if (key == "open") {
                                    req.body.hasOwnProperty("open") ? updatedDataForDB[key] = false :
                                        updatedDataForDB[key] = true
                                } else if (key == "updated_on") {
                                    updatedDataForDB[key] = new Date().toISOString()
                                } else if (req.body.hasOwnProperty(key) && req.body[key]) { // has key and is not empty
                                    updatedDataForDB[key] = req.body[key];
                                } else {
                                    updatedDataForDB[key] = dataDB[key];
                                }
                            });

                        myDB.updateOne({ _id: dataDB._id }, { $set: updatedDataForDB })
                            .then(res.send({ result: 'successfully updated', '_id': dataDB._id }))
                    }
                })
        })

        .delete(function(req, res) {
            //let project = req.params.project;

            if (!req.body._id) {
                res.send({ error: 'missing _id' })

            } else {
                myDB.deleteOne({ _id: req.body._id })
                    .then(response => {
                        response.deletedCount == 1
                            ? res.send({ result: 'successfully deleted', '_id': req.body._id })
                            : res.send({ error: 'could not delete', '_id': req.body._id })
                    }).catch(e => {
                        console.log(`Cant delete data:\n${e}`)
                    })
            }
        });

}

